import flet as ft
import os
import sys

# Import the optimized python engine
# Ensure src is in path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__))))
try:
    from core import engine
except ImportError:
    # Fallback if running from different dir
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from core import engine

OUTPUT_FILE = "wordlist.txt"

def main(page: ft.Page):
    page.title = "Optimized Wordlist Generator (Python Edition)"
    page.theme_mode = ft.ThemeMode.DARK
    page.padding = 20
    page.window_width = 1000
    page.window_height = 800

    # --- State ---
    txt_first = ft.TextField(label="First Name", expand=True)
    txt_middle = ft.TextField(label="Middle Name", expand=True)
    txt_last = ft.TextField(label="Last Name", expand=True)
    txt_aliases = ft.TextField(label="Aliases (comma-sep)", hint_text="hacker, neo", expand=True)
    txt_users = ft.TextField(label="Usernames (comma-sep)", expand=True)
    txt_extra = ft.TextField(label="Extra Keywords (comma-sep)", hint_text="company, pet", expand=True)
    txt_dob = ft.TextField(label="DOB (DD/MM/YYYY)", width=200)
    
    txt_min = ft.TextField(label="Min Len", value="4", width=100)
    txt_max = ft.TextField(label="Max Len", value="25", width=100)
    txt_special = ft.TextField(label="Special Chars (comma-sep)", hint_text="!,@,#,$", expand=True)
    
    chk_leet = ft.Checkbox(label="Enable Leet Speak (a->@, e->3)", value=False)
    
    # Depth Slider
    sld_depth = ft.Slider(min=2, max=4, divisions=2, value=3, label="Max Combination Depth: {value}")
    
    lbl_status = ft.Text("Ready", color="grey")
    lbl_stats = ft.Text("", weight="bold")
    
    txt_search = ft.TextField(label="Find text in wordlist (Live)", expand=True)
    
    # Virtualized List for performance with many items
    preview_list = ft.ListView(expand=True, spacing=2, padding=10, auto_scroll=False)
    
    # File Saver
    def save_file_result(e: ft.FilePickerResultEvent):
        if e.path:
            try:
                import shutil
                shutil.copy(OUTPUT_FILE, e.path)
                lbl_status.value = f"Saved to {e.path}"
                lbl_status.color = "green"
                page.update()
            except Exception as ex:
                lbl_status.value = f"Error saving: {ex}"
                lbl_status.color = "red"
                page.update()

    save_file_dialog = ft.FilePicker(on_result=save_file_result)
    page.overlay.append(save_file_dialog)

    # --- Logic ---

    def format_size(size_bytes):
        if size_bytes >= 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"
        elif size_bytes >= 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.2f} MB"
        else:
            return f"{size_bytes / 1024:.2f} KB"

    def run_generator(e):
        lbl_status.value = "Generating... (This may take a while for high usage)"
        lbl_status.color = "blue"
        page.update()

        try:
            # Call Python Engine directly
            count = engine.generate_wordlist(
                first=txt_first.value,
                middle=txt_middle.value,
                last=txt_last.value,
                aliases=txt_aliases.value,
                usernames=txt_users.value,
                extra=txt_extra.value,
                dob=txt_dob.value,
                special_chars=txt_special.value,
                min_len=int(txt_min.value) if txt_min.value.isdigit() else 4,
                max_len=int(txt_max.value) if txt_max.value.isdigit() else 25,
                enable_leet=chk_leet.value,
                depth=int(sld_depth.value),
                output_file=OUTPUT_FILE
            )
            
            # Statistics
            size = os.path.getsize(OUTPUT_FILE)
            lbl_stats.value = f"Generated: {count} words | Size: {format_size(size)}"
            lbl_status.value = "Done."
            lbl_status.color = "green"
            
            # Reset pagination
            current_offset[0] = 0
            load_preview(None, reset=True)

        except Exception as ex:
            lbl_status.value = f"Error: {str(ex)}"
            lbl_status.color = "red"
            import traceback
            traceback.print_exc()
        
        page.update()

    # Pagination State
    # current_offset[0] is for file bytes (Preview Mode)
    # current_offset[1] is for skipped matches (Search Mode)
    current_offset = [0, 0]
    CHUNK_SIZE = 1000
    
    # Cache for Incremental Search
    # Stores results of previous search to filter locally
    search_cache = {
        "query": "",
        "matches": [],
        "full_loaded": False # True if we hold ALL matches for this query
    }

    def load_preview(e, reset=False):
        if reset:
            preview_list.controls.clear()
            current_offset[0] = 0
            current_offset[1] = 0
            if not txt_search.value:
                # Clear cache if search cleared
                search_cache["query"] = ""
                search_cache["matches"] = []
                search_cache["full_loaded"] = False

        if not os.path.exists(OUTPUT_FILE):
             preview_list.controls.clear()
             preview_list.controls.append(ft.Text("No wordlist generated yet."))
             page.update()
             return

        query = txt_search.value.strip()
        
        # Capture the query at the start
        current_val = query
        
        # Branch 1: Search Mode
        if current_val:
            try:
                # Debug feedback in UI
                lbl_status.value = f"Searching for '{current_val}'..."
                lbl_status.color = "yellow"
                page.update()
                
                matches = []
                count = 0
                CACHE_LIMIT = 50000 
                
                # INCREMENTAL SEARCH LOGIC
                use_cache = False
                if (search_cache["query"] 
                    and current_val.lower().startswith(search_cache["query"].lower())
                    and search_cache["full_loaded"]):
                     use_cache = True
                
                if use_cache:
                    # Filter in-memory
                    matches = [m for m in search_cache["matches"] if current_val.lower() in m.lower()]
                    count = len(matches)
                    search_cache["query"] = current_val
                    search_cache["matches"] = matches
                else:
                    # Search from File
                    found_matches, total_count = engine.search_in_file(OUTPUT_FILE, current_val, skip=0, limit=CACHE_LIMIT)
                    
                    matches = found_matches
                    count = total_count
                    
                    # Store in Cache
                    search_cache["query"] = current_val
                    search_cache["matches"] = matches
                    # If we found FEWER than the limit, we have everything!
                    search_cache["full_loaded"] = (count <= CACHE_LIMIT)

                lbl_status.value = f"Search done. Found {count} matches."
                lbl_status.color = "green"
                
                if reset:
                    preview_list.controls.clear()
                    preview_list.controls.append(ft.Text(f"Found {count} matches for '{current_val}':", color="cyan", weight="bold"))
                
                # Display Chunk (Pagination logic applied to 'matches' list)
                start_idx = current_offset[1]
                end_idx = start_idx + CHUNK_SIZE
                
                visible_matches = matches[start_idx : end_idx]
                
                for line in visible_matches:
                     preview_list.controls.append(ft.Text(line, font_family="Consolas"))
                
                # Update shown count
                current_offset[1] += len(visible_matches)
                
                # Add Load More
                if current_offset[1] < count:
                    if preview_list.controls and isinstance(preview_list.controls[-1], ft.OutlinedButton):
                       preview_list.controls.pop()
                    
                    if current_offset[1] >= len(matches) and not search_cache["full_loaded"]:
                         btn_more = ft.OutlinedButton(f"Start Over/Deep Search...", on_click=lambda _: load_preview(None)) 
                    else:
                        btn_more = ft.OutlinedButton(f"Load Next matched...", on_click=lambda _: load_preview(None))
                        preview_list.controls.append(btn_more)

            except Exception as ex:
                lbl_status.value = f"Search Error: {str(ex)}"
                lbl_status.color = "red"
                page.update()
                print(f"Search Exception: {ex}")
                import traceback
                traceback.print_exc()

        # Branch 2: Pagination Mode (Sequential Read)
        else:
            try:
                # Remove "Load More" button if it exists
                if preview_list.controls and isinstance(preview_list.controls[-1], ft.OutlinedButton):
                    preview_list.controls.pop()

                with open(OUTPUT_FILE, 'r', encoding='utf-8', errors='ignore') as f:
                    # Seek logic
                    if current_offset[0] == 0:
                        f.seek(0)
                    else:
                        f.seek(current_offset[0])
                    
                    added_count = 0
                    for _ in range(CHUNK_SIZE):
                        line = f.readline()
                        if not line: break
                        preview_list.controls.append(ft.Text(line.strip(), font_family="Consolas"))
                        added_count += 1
                    
                    current_offset[0] = f.tell() # Save byte position
                    
                    if added_count == CHUNK_SIZE:
                        # Add Load More Button
                        btn_more = ft.OutlinedButton("Load More Words...", on_click=lambda _: load_preview(None))
                        preview_list.controls.append(btn_more)
            except Exception as ex:
                preview_list.controls.append(ft.Text(f"Read Error: {ex}"))
        
        page.update()

    def open_folder(e):
        if os.name == 'nt':
            os.startfile(os.getcwd())
        else:
            subprocess.run(['xdg-open', os.getcwd()])
    
    # --- Advanced Tools State ---
    adv_mode = ft.Dropdown(
        label="Select Tool",
        options=[
            ft.dropdown.Option("Combinator (File + File)"),
            ft.dropdown.Option("Hybrid (File + Mask)"),
            ft.dropdown.Option("Rule Processor")
        ],
        value="Combinator (File + File)"
    )
    
    # Pickers
    txt_file_a = ft.TextField(label="Input File A", expand=True, read_only=True)
    txt_file_b = ft.TextField(label="Input File B", expand=True, read_only=True)
    
    def pick_file_a(e: ft.FilePickerResultEvent):
        if e.files: txt_file_a.value = e.files[0].path; page.update()
            
    def pick_file_b(e: ft.FilePickerResultEvent):
        if e.files: txt_file_b.value = e.files[0].path; page.update()

    picker_a = ft.FilePicker(on_result=pick_file_a)
    picker_b = ft.FilePicker(on_result=pick_file_b)
    page.overlay.extend([picker_a, picker_b])
    
    # Hybrid/Rule Inputs
    txt_adv_mask = ft.TextField(label="Mask / Rule", hint_text="?d?d for Hybrid, or '$1 u' for Rules", expand=True)
    
    def run_advanced(e):
        tool = adv_mode.value
        file_a = txt_file_a.value
        file_b = txt_file_b.value
        mask_rule = txt_adv_mask.value
        
        if not file_a or (tool.startswith("Combinator") and not file_b):
            lbl_status.value = "Error: Select Input Files"
            lbl_status.color = "red"
            page.update()
            return
            
        lbl_status.value = f"Running {tool}..."
        lbl_status.color = "yellow"
        page.update()
        
        try:
            import time
            time.sleep(0.1)
            
            c = 0
            if tool.startswith("Combinator"):
                c = engine.combinator_tool(file_a, file_b, OUTPUT_FILE)
            elif tool.startswith("Hybrid"):
                c = engine.hybrid_tool(file_a, mask_rule, OUTPUT_FILE)
            elif tool.startswith("Rule"):
                c = engine.apply_rules(file_a, mask_rule, OUTPUT_FILE)
                
            if isinstance(c, str): # Error message
                lbl_status.value = f"Error: {c}"
                lbl_status.color = "red"
            else:
                size = os.path.getsize(OUTPUT_FILE)
                lbl_stats.value = f"Generated: {c} words | Size: {format_size(size)}"
                lbl_status.value = "Done."
                lbl_status.color = "green"
                current_offset[0] = 0
                current_offset[1] = 0
                search_cache["query"] = ""
                load_preview(None, reset=True)
                
        except Exception as ex:
            lbl_status.value = f"Error: {ex}"
            lbl_status.color = "red"
        page.update()

    # --- Brute Force Inputs ---
    txt_bf_chars = ft.TextField(label="Characters (comma-sep)", hint_text="a,b,c,1,2,3 or words", expand=True)
    txt_bf_min = ft.TextField(label="Min Len", value="1", width=100)
    txt_bf_max = ft.TextField(label="Max Len", value="4", width=100)

    def run_brute_force(e):
        lbl_status.value = "Calculating complexity..."
        lbl_status.color = "yellow"
        page.update()

        try:
            # Pre-flight check
            c_val = txt_bf_chars.value or ""
            # Logic matches engine.py parsing to predict count
            pool = set([x.strip() for x in c_val.split(',') if x.strip()])
            if not pool and c_val.strip():
                 pool = set(c_val.strip()) # Fallback
            
            p_len = len(pool)
            mn = int(txt_bf_min.value) if txt_bf_min.value.isdigit() else 1
            mx = int(txt_bf_max.value) if txt_bf_max.value.isdigit() else 4
            
            total_est = 0
            for r in range(mn, mx + 1):
                total_est += p_len ** r
            
            # Safety Threshold: 100 Million (Approx 1GB+ file)
            # 18 chars ^ 8 len = 11 Billion combinations.
            if total_est > 100_000_000:
                lbl_status.value = f"Stopped: Too massive ({total_est:,} words). Reduce Max Len."
                lbl_status.color = "red"
                page.snack_bar = ft.SnackBar(ft.Text(f"Operation too large: {total_est:,} combinations! Try Max Len 3 or 4."), open=True)
                page.update()
                return

            lbl_status.value = f"Brute Forcing {total_est:,} combos..."
            lbl_status.color = "orange"
            page.update()
            
            # Tiny delay to let UI update before heavy blocking work
            import time
            time.sleep(0.1)

            count = engine.generate_brute_force(
                chars_str=txt_bf_chars.value,
                min_len=mn,
                max_len=mx,
                output_file=OUTPUT_FILE
            )
            
            size = os.path.getsize(OUTPUT_FILE)
            lbl_stats.value = f"Generated: {count} words | Size: {format_size(size)}"
            lbl_status.value = "Done."
            lbl_status.color = "green"
            
            current_offset[0] = 0
            current_offset[1] = 0
            load_preview(None, reset=True)

        except Exception as ex:
            lbl_status.value = f"Error: {str(ex)}"
            lbl_status.color = "red"
            import traceback
            traceback.print_exc()
        
        page.update()

    def save_wordlist(e):
        save_file_dialog.save_file(dialog_title="Save Wordlist", file_name="custom_wordlist.txt")

    # --- Mask / Pattern Inputs ---
    txt_mask = ft.TextField(label="Pattern Mask", hint_text="Admin?d?d?d (matches Admin000-999)", expand=True)
    
    def run_mask(e):
        lbl_status.value = "Calculating complexity..."
        lbl_status.color = "yellow"
        page.update()

        try:
             # Safety limit check
             # We need to estimate count.
             # Parse mask manually to estimate? or engine helper?
             # Simple estimation:
             import string
             est = 1
             m = txt_mask.value
             i = 0
             while i < len(m):
                 if m[i] == '?' and i+1 < len(m):
                     code = m[i+1]
                     if code == 'd': est *= 10
                     elif code == 'l': est *= 26
                     elif code == 'u': est *= 26
                     elif code == 's': est *= 32
                     elif code == 'a': est *= 94
                     elif code == '?': pass
                     i += 2
                 else:
                     i += 1
             
             if est > 100_000_000:
                lbl_status.value = f"Stopped: Too massive ({est:,})."
                lbl_status.color = "red"
                page.snack_bar = ft.SnackBar(ft.Text(f"Too large ({est:,})!"), open=True)
                page.update()
                return

             lbl_status.value = f"Generating Pattern ({est:,} words)..."
             lbl_status.color = "orange"
             page.update()
             
             import time
             time.sleep(0.1)
             
             count = engine.generate_from_mask(txt_mask.value, OUTPUT_FILE)
             
             size = os.path.getsize(OUTPUT_FILE)
             lbl_stats.value = f"Generated: {count} words | Size: {format_size(size)}"
             lbl_status.value = "Done."
             lbl_status.color = "green"
             
             current_offset[0] = 0
             current_offset[1] = 0
             search_cache["query"] = "" # Invalidate Cache
             load_preview(None, reset=True)
             
        except Exception as ex:
             lbl_status.value = f"Error: {ex}"
             lbl_status.color = "red"
             page.update()



    # --- Events & Controls ---
    # Smart Generate Button is inline in smart_content, but others are used in search_area shared block.
    
    btn_search = ft.IconButton(icon="search", on_click=lambda e: load_preview(e, reset=True))
    txt_search.on_submit = lambda e: load_preview(e, reset=True)
    txt_search.on_change = lambda e: load_preview(e, reset=True) 
    
    btn_open = ft.ElevatedButton("Open Folder", on_click=open_folder)
    btn_save = ft.ElevatedButton("Download Wordlist", on_click=save_wordlist, icon="download")

    # --- Layout Construction ---
    
    # 1. Smart Tab Content
    smart_content = ft.Column([
        ft.Row([txt_first, txt_middle, txt_last]),
        ft.Row([txt_aliases, txt_users]),
        ft.Row([txt_extra, txt_dob]),
        ft.Row([
            txt_min, txt_max, 
            txt_special,
        ]),
        ft.Text("Combination Depth (Complexity):"),
        sld_depth,
        chk_leet,
        ft.Container(height=10),
        ft.ElevatedButton("Generate Smart Wordlist", on_click=run_generator, height=50, width=300),
    ], scroll=ft.ScrollMode.ADAPTIVE)

    # 2. Brute Force Tab Content
    brute_content = ft.Column([
        ft.Text("Generates every possible combination of the characters below.", italic=True),
        txt_bf_chars,
        ft.Row([txt_bf_min, txt_bf_max]),
        ft.Container(height=10),
        ft.ElevatedButton("Generate Brute Force", on_click=run_brute_force, height=50, width=300, color="orange"),
    ])

    # 3. Pattern Tab Content
    mask_content = ft.Column([
        ft.Text("Use Standard Mask Format:", italic=True),
        ft.Text("?d = digit (0-9), ?l = lower (a-z), ?u = upper (A-Z), ?s = symbol", size=12, color="grey"),
        txt_mask,
        ft.Container(height=10),
        ft.ElevatedButton("Generate Pattern", on_click=run_mask, height=50, width=300, color="teal"),
    ])
    
    # 4. Advanced Tab
    adv_content = ft.Column([
        ft.Text("Advanced Toolkit", size=20, weight="bold"),
        adv_mode,
        ft.Divider(),
        ft.Row([
            txt_file_a, 
            ft.IconButton(icon="folder_open", on_click=lambda _: picker_a.pick_files())
        ]),
        ft.Row([
            txt_file_b, 
            ft.IconButton(icon="folder_open", on_click=lambda _: picker_b.pick_files())
        ]),
        ft.Text("For Combinator: Select File A and B. For Hybrid/Rules: Select File A and use Input below.", size=12, italic=True),
        txt_adv_mask,
        ft.ElevatedButton("Run Tool", on_click=run_advanced, icon="build", color="pink"),
    ])

    # 5. Tabs
    tabs = ft.Tabs(
        selected_index=0,
        animation_duration=300,
        tabs=[
            ft.Tab(
                text="Smart Generator",
                icon="person",
                content=ft.Container(content=smart_content, padding=20)
            ),
            ft.Tab(
                text="Custom Char Gen", 
                icon="lock",
                content=ft.Container(content=brute_content, padding=20)
            ),
            ft.Tab(
                text="Pattern Gen", 
                icon="qr_code",
                content=ft.Container(content=mask_content, padding=20)
            ),
            ft.Tab(
                text="Advanced Utils", 
                icon="settings",
                content=ft.Container(content=adv_content, padding=20)
            ),
        ],
        expand=True,
    )

    # 4. Search & Preview Area (Shared)
    search_area = ft.Column([
        ft.Divider(),
        ft.Row([btn_save, btn_open]),
        ft.Row([lbl_status, lbl_stats], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
        ft.Container(height=10),
        ft.Row([ft.Text("Preview & Find", size=20, weight="bold"), ft.Container(expand=True)]),
        ft.Row([txt_search, btn_search]),
        ft.Container(
            content=preview_list,
            border=ft.border.all(1, "white54"),
            border_radius=5,
            padding=10,
            bgcolor="black12",
            height=300 # Fixed height for scrollable area
        )
    ])

    page.add(
        ft.Text("Advanced Wordlist Generator", size=30, weight="bold"),
        # We need the tabs to act as the main body, but preview is below.
        # Tabs control only the input method.
        # Flet Tabs 'content' fills the tab view. We can put preview OUTSIDE tabs.
        ft.Container(height=400, content=tabs), # Fixed height for input area
        search_area
    )

if __name__ == "__main__":
    # CLI Support
    import argparse
    if len(sys.argv) > 1:
        # Check if Flet specific args like -p are absent? 
        # Flet args usually are handled by flet.app. 
        # But for 'generator' usage:
        
        parser = argparse.ArgumentParser(description="Wordlist Generator CLI")
        parser.add_argument("--cli", action="store_true", help="Run in CLI mode")
        parser.add_argument("-f", "--first", default="")
        parser.add_argument("-l", "--last", default="")
        parser.add_argument("-m", "--middle", default="")
        parser.add_argument("-a", "--aliases", default="")
        parser.add_argument("-u", "--users", default="")
        parser.add_argument("-x", "--extra", default="")
        parser.add_argument("-d", "--dob", default="")
        parser.add_argument("-s", "--special", default="")
        parser.add_argument("-min", type=int, default=4)
        parser.add_argument("-max", type=int, default=25)
        parser.add_argument("-leet", action="store_true")
        parser.add_argument("-o", "--output", default="wordlist.txt")
        
        # If --cli or other flags present that aren't for Flet, assume CLI.
        # Flet takes unknown args?
        
        args, unknown = parser.parse_known_args()
        
        # Heuristic: If --cli is passed OR typical generator args are seen
        if args.cli or (len(sys.argv) > 1 and not sys.argv[0].endswith("flet")):
             # Run logic
             print(f"[*] Generating wordlist to {args.output}...")
             count = engine.generate_wordlist(
                 first=args.first, last=args.last, middle=args.middle,
                 aliases=args.aliases, usernames=args.users, extra=args.extra,
                 dob=args.dob, special_chars=args.special,
                 min_len=args.min, max_len=args.max,
                 enable_leet=args.leet, output_file=args.output
             )
             print(f"[+] Done. Generated {count} words.")
        else:
             ft.app(target=main)
    else:
        ft.app(target=main)
