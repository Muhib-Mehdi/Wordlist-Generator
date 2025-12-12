import itertools
import os

# Settings
BUFFER_SIZE = 1024 * 1024  # 1MB Write Buffer

def get_substrings(text, min_len=3):
    """Generates all sliding window substrings."""
    if not text: return []
    subs = set()
    n = len(text)
    for length in range(min_len, n + 1):
        for i in range(n - length + 1):
            subs.add(text[i : i + length])
    return list(subs)

import string

def generate_from_mask(mask, output_file="wordlist.txt"):
    """
    Generates words based on Standard Mask Syntax.
    ?d = digits, ?l = lower, ?u = upper, ?s = symbols
    ?a = all, ?? = literal '?'
    Example: Admin?d?d?d -> Admin000 -> Admin999
    """
    
    # 1. Parse Mask into list of character pools
    # e.g. "A?d" -> [['A'], ['0'..'9']]
    pools = []
    
    i = 0
    n = len(mask)
    while i < n:
        char = mask[i]
        
        if char == '?' and i + 1 < n:
            code = mask[i+1]
            if code == 'd':
                pools.append(string.digits)
            elif code == 'l':
                pools.append(string.ascii_lowercase)
            elif code == 'u':
                pools.append(string.ascii_uppercase)
            elif code == 's':
                pools.append(string.punctuation)
            elif code == 'a':
                # All printable except whitespace? Or strictly d+l+u+s?
                # Standard ?a is ?l?u?d?s
                pools.append(string.digits + string.ascii_letters + string.punctuation)
            elif code == '?':
                pools.append(['?'])
            else:
                # Unknown code, treat as literal "?code"? 
                # Or just literal '?' then code?
                # Let's treat ?x as literal '?' then literal 'x'
                pools.append(['?'])
                # i will increment only by 1 effectively below differently
                # Actually, easier to just consume '?' as literal if code invalid?
                # Let's stick to strict codes for now.
                i -= 1 # Backtrack to treat ? as literal?
                pools.append(['?'])
                
            i += 2 # Skip ? and code
        else:
            # Literal character
            pools.append([char])
            i += 1
            
    # 2. Generator
    count = 0
    with open(output_file, 'w', encoding='utf-8', buffering=BUFFER_SIZE) as f:
        # itertools.product(*pools) handles the Cartesian product of all positions
        for p in itertools.product(*pools):
            f.write("".join(p) + '\n')
            count += 1
            
    return count

def get_sub_combinations(items):
    """Generates all permutations of the extras list (e.g. 1,2 -> 1,2,12,21)."""
    if not items: return []
    combos = set(items)
    # Generate combinations of extras up to length 3
    # If user puts "1,2,3", we want "123", "321", "12", etc.
    safe_limit = 4 if len(items) < 6 else 2
    for r in range(2, safe_limit + 1):
        for p in itertools.permutations(items, r):
            combos.add("".join(p))
    return list(combos)

def generate_wordlist(
    first="", middle="", last="", 
    aliases="", usernames="", extra="", 
    dob="", special_chars="", 
    min_len=4, max_len=25, 
    enable_leet=False, 
    depth=3,
    output_file="wordlist.txt"
):
    """
    Generates a wordlist based on inputs.
    """
    
    # 1. Parsing Inputs
    base_words = set()
    
    def add(s):
        if s: base_words.add(s.strip())

    # Add Names
    add(first)
    add(middle)
    add(last)
    
    # Add Substrings for Names (The "Split" requirement)
    for name in [first, middle, last]:
        if name:
            for sub in get_substrings(name, min_len=3):
                base_words.add(sub)
    
    # Process Aliases and Usernames (Treat like names with substrings)
    for x in aliases.split(','): 
        val = x.strip()
        if val: 
            add(val)
            for sub in get_substrings(val, min_len=3):
                base_words.add(sub)

    for x in usernames.split(','): 
        val = x.strip()
        if val: 
            add(val)
            for sub in get_substrings(val, min_len=3):
                base_words.add(sub)
    
    # Handle Extras with recursive combinations
    raw_extras = [x.strip() for x in extra.split(',') if x.strip()]
    extra_combos = get_sub_combinations(raw_extras)
    for x in extra_combos:
        base_words.add(x)
    
    # Date Handling
    if dob:
        # Normalize separators
        clean_dob = dob.replace('/', ' ').replace('-', ' ').replace('.', ' ')
        parts = clean_dob.split()
        
        # Add individual parts (14, 10, 2008)
        for p in parts:
            add(p)
            if len(p) == 4: # Year
                add(p[2:]) # Short year (08)
        
        # Add Combinations: DDMM, MMDD, DDMMYYYY, YYYYMMDD
        # Assume parts are [DD, MM, YYYY] based on typical input, or try to be generic
        if len(parts) >= 2:
            add(parts[0] + parts[1]) # DDMM
            add(parts[1] + parts[0]) # MMDD
            if len(parts) >= 3:
                add(parts[0] + parts[1] + parts[2]) # DDMMYYYY
                add(parts[2] + parts[1] + parts[0]) # YYYYMMDD
    
    specials = [s.strip() for s in special_chars.split(',') if s.strip()]
    # Removed empty default to prevent accidental massive duplication
    
    # 2. generating Variants (Case + Leet)
    pool = set()
    for w in base_words:
        pool.add(w)
        pool.add(w.lower())
        pool.add(w.upper())
        pool.add(w.capitalize())
        if enable_leet:
            pool.add(to_leet(w))
            
    # Add specials to pool
    for s in specials:
        pool.add(s)
    
    pool_list = list(pool)
    pool_list.sort()
    
    # 3. Writing with Buffer
    count = 0
    with open(output_file, 'w', encoding='utf-8', buffering=BUFFER_SIZE) as f:
        
        def write_if_valid(word):
            if min_len <= len(word) <= max_len:
                f.write(word + '\n')
                return 1
            return 0

        # Dynamic Exhaustive Generation based on Depth
        # Default Depth 3: Pool x Pool x Pool
        for r in range(1, depth + 1):
             for p in itertools.product(pool_list, repeat=r):
                 count += write_if_valid("".join(p))

    return count

    return count

def combinator_tool(file_a, file_b, output_file="wordlist.txt"):
    """
    Combines two wordlists: WordA + WordB.
    Optimized: Reads File B into memory (smaller one ideally), streams File A.
    """
    # Load File B into memory (assuming it fits, e.g. names)
    pool_b = []
    try:
        with open(file_b, 'r', encoding='utf-8', errors='ignore') as fb:
            pool_b = [line.strip() for line in fb if line.strip()]
    except Exception as e:
        return f"Error reading File B: {e}"

    count = 0
    buffer = []
    
    with open(file_a, 'r', encoding='utf-8', errors='ignore') as fa, \
         open(output_file, 'w', encoding='utf-8', buffering=BUFFER_SIZE) as fout:
        
        for line_a in fa:
            word_a = line_a.strip()
            if not word_a: continue
            
            for word_b in pool_b:
                fout.write(word_a + word_b + '\n')
                count += 1
                
    return count

def hybrid_tool(file_a, mask, output_file="wordlist.txt"):
    """
    Hybrid Attack: Wordlist + Mask.
    e.g. File has 'Admin', Mask is '?d?d' -> Admin00 - Admin99.
    """
    # 1. Parse Mask Pools (Reuse logic roughly or call internal helper if refactored)
    # Re-impl simple parser here for robust standalone
    pools = []
    i = 0
    n = len(mask)
    while i < n:
        char = mask[i]
        if char == '?' and i+1 < n:
            code = mask[i+1]
            if code == 'd': pools.append(string.digits)
            elif code == 'l': pools.append(string.ascii_lowercase)
            elif code == 'u': pools.append(string.ascii_uppercase)
            elif code == 's': pools.append(string.punctuation)
            elif code == 'a': pools.append(string.digits + string.ascii_letters + string.punctuation)
            elif code == '?': pools.append(['?'])
            else: pools.append(['?'])
            i += 2
        else:
            pools.append([char])
            i += 1
            
    # Pre-calculate all mask suffixes
    suffixes = ["".join(p) for p in itertools.product(*pools)]
    
    count = 0
    with open(file_a, 'r', encoding='utf-8', errors='ignore') as fa, \
         open(output_file, 'w', encoding='utf-8', buffering=BUFFER_SIZE) as fout:
        
        for line in fa:
            word = line.strip()
            if not word: continue
            
            for s in suffixes:
                fout.write(word + s + '\n')
                count += 1
    return count

def apply_rules(file_input, rule_str, output_file="wordlist.txt"):
    """
    Apply Standard Transformation rules to a wordlist.
    Supported: $x (Append), ^x (Prepend), u (Upper), l (Lower), c (Title), r (Reverse), d (Duplicate)
    """
    count = 0
    with open(file_input, 'r', encoding='utf-8', errors='ignore') as fin, \
         open(output_file, 'w', encoding='utf-8', buffering=BUFFER_SIZE) as fout:
        
        for line in fin:
            word = line.strip()
            if not word: continue
            
            # Process Rule String (e.g. "c $1")
            # We apply ALL rules in sequence to the word
            new_word = word
            
            # Parse rules split by space ?? Or standard strict chars?
            # Standard rules are usually line-separated in a file. 
            # Here user likely types "u $!" (Upper then Append !)
            rules = rule_str.split()
            
            for rule in rules:
                if not new_word: break
                
                if rule == 'u': new_word = new_word.upper()
                elif rule == 'l': new_word = new_word.lower()
                elif rule == 'c': new_word = new_word.capitalize()
                elif rule == 'r': new_word = new_word[::-1]
                elif rule == 'd': new_word = new_word + new_word
                elif rule.startswith('$') and len(rule) > 1:
                    new_word = new_word + rule[1:]
                elif rule.startswith('^') and len(rule) > 1:
                    new_word = rule[1:] + new_word
                    
            fout.write(new_word + '\n')
            count += 1
    return count

def search_in_file(filename, query, skip=0, limit=2000):
    """
    Optimized Search using Chunked Reading (1MB blocks).
    Much faster than line-by-line for large files.
    """
    matches = []
    total_count = 0
    query_lower = query.lower()
    
    # Chunk size in bytes (1MB is a good balance for UI responsiveness)
    CHUNK_SIZE = 1024 * 1024 
    
    try:
        with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
            leftover = ""
            while True:
                chunk = f.read(CHUNK_SIZE)
                if not chunk:
                    break
                
                # Prepend leftover from previous chunk (to handle split words)
                data = leftover + chunk
                
                # Check if query is in this massive block at all (Fast fail)
                data_lower = data.lower()
                if query_lower not in data_lower:
                    # Keep the last partial line for next chunk safely
                    last_newline = data.rfind('\n')
                    if last_newline != -1:
                        leftover = data[last_newline+1:]
                    else:
                        leftover = data # Keep growing if line > 1MB (rare)
                    continue
                
                # If found, we must process lines, but only for this chunk
                # Find the last newline to ensure we don't cut a line in half
                last_newline = data.rfind('\n')
                if last_newline != -1:
                    process_data = data[:last_newline+1]
                    leftover = data[last_newline+1:]
                else:
                    # logic for extremely long lines or end of file
                    process_data = data
                    leftover = ""
                
                # Now finding precise matches in this interesting chunk
                # Still line-by-line but done in memory batches = faster
                for line in process_data.splitlines():
                    if query_lower in line.lower():
                        total_count += 1
                        if total_count <= skip:
                            continue
                        if len(matches) < limit:
                            matches.append(line.strip())
                
                # Optimization: If we have enough matches, we could stop?
                # User wants "total count" also... so we must scan full file
                # unless we want to compromise total count speed.
                # Assuming user needs to see "Found 50,000 matches", we must scan all.
                
            # Process final leftover
            if leftover and query_lower in leftover.lower():
                 if len(matches) < limit:
                     matches.append(leftover.strip())
                     total_count += 1

    except FileNotFoundError:
        return (["Error: File not found."], 0)
    return (matches, total_count)

def generate_brute_force(chars_str, min_len, max_len, output_file="wordlist.txt"):
    """
    Generates every permutation of provided characters.
    """
    # Parse chars: "a,b,c" -> ['a','b','c']
    pool = set()
    parts = chars_str.split(',')
    for p in parts:
        val = p.strip()
        if val:
            pool.add(val)
    
    # Fallback to characters if no commas and string not empty
    if not pool and chars_str.strip():
        # If user entered "abc" without commas
        for char in chars_str.strip():
            pool.add(char)

    pool_list = list(pool)
    pool_list.sort()
    
    count = 0
    with open(output_file, 'w', encoding='utf-8', buffering=BUFFER_SIZE) as f:
        # Range inclusive
        for r in range(min_len, max_len + 1):
            for p in itertools.product(pool_list, repeat=r):
                f.write("".join(p) + '\n')
                count += 1
    
    return count
