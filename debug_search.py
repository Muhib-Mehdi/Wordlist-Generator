import sys
import os

# Ensure src is in path
sys.path.append(os.path.join(os.getcwd(), 'src'))
from core import engine

def test_search():
    print("--- Starting Search Debug ---")
    
    # 1. Create Dummy Wordlist
    filename = "debug_wordlist.txt"
    with open(filename, "w", encoding="utf-8") as f:
        f.write("apple\n")
        f.write("banana\n")
        f.write("cherry\n")
        f.write("AppLePie\n") # Case test
        f.write("grape\n")
        f.write("apple\n") # Duplicate for count
    
    print(f"Created {filename} with 6 words.")

    # 2. Test Basic Search
    print("\nTest 1: Search 'apple' (Case Insensitive)")
    # Should match 'apple', 'AppLePie', 'apple' -> 3 matches
    matches, count = engine.search_in_file(filename, "apple")
    print(f"Matches Found: {count}")
    print(f"Match List: {matches}")
    
    if count == 3 and len(matches) == 3:
        print("PASS: Basic Search")
    else:
        print("FAIL: Basic Search")

    # 3. Test Skip/Pagination
    print("\nTest 2: Search 'apple' with skip=1")
    # Should skip first 'apple', return 'AppLePie', 'apple' -> 2 matches returned, count still 3
    matches, count = engine.search_in_file(filename, "apple", skip=1)
    print(f"Total Count: {count}")
    print(f"Returned Matches (should be 2): {len(matches)}")
    print(f"Content: {matches}")
    
    if count == 3 and len(matches) == 2 and matches[0].lower() == "applepie":
        print("PASS: Pagination Logic")
    else:
        print("FAIL: Pagination Logic")

    # Clean up
    if os.path.exists(filename):
        os.remove(filename)

if __name__ == "__main__":
    test_search()
