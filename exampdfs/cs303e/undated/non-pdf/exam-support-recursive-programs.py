################################################################################
#                                                                              #
#                        Examples of Recursive Functions                       #
#                                                                              #
################################################################################

# These first two are from final exams from previous semesters. 

"""
(10 points) Complete the recursive function transformString below
  that, given a string as input, returns a string like the input
  except: 

* lowercase letters are replaced by their uppercase equivalent;
* uppercase letters are replaced by their lowercase equivalent;
* digits are removed;
* all other characters are left unchanged.

Your solution must be recursive;  you may not use loops and you may
not define a recursive helper function. This shows some sample
behavior:

>>> transformString("abCDef123!@#$&GHij")
'ABcdEF!@#$&ghIJ'
>>> transformString("")
''
>>> transformString("12345#")
'#'
"""

def transformString( s ):
    # The simplest string is the empty string.
    if not s:
        return ""
    # Here we know s contains at least one character.
    ch = s[0]
    # Generate a new character with the appropriate 
    # transformations of ch.
    if ch.isupper():
        newch = ch.lower()
    elif ch.islower():
        newch = ch.upper()
    elif ch.isdigit():
        newch = ""
    else:
        newch = ch
    # Make the recursive call appending ch to the front
    # of the transformation of the rest of the string.
    return newch + transformString( s[1:] )


# I would more likely have written it this way:


def transformCharacter( ch ):
    if ch.isupper():
        return ch.lower()
    elif ch.islower():
        return ch.upper()
    elif ch.isdigit():
        return ""
    else:
        return ch

def transformString2( s ):
    if not s:
        return s
    else:
        return transformCharacter( s[0] ) + transformString2( s[1:] )

#----------------------------------------------------------------------

""" (10 points) Fill in the function below to do a recursive function
lexLess( L1, L2 ) that does a lexicographic comparison of two lists of
integers.  Return True if the first parameter is less than the second
lexicographically and False otherwise. That is, compare corresponding
elements until you find one that is less, or one list runs out.  If
the two lists are equal, you should return False.  Also, don't use any
of the comparison operators (<, >, <=, >=, ==, !=) on lists; you can
use them on individual integers.

Here are some examples:

>>> lexLess( [ 1, 2 ], [1, 2, 3])
True
>>> lexLess( [ 1, 2 ], [1 ] )
False
>>> lexLess( [], [] )
False
>>> lexLess( [ 1 ], [] )
False
>>> lexLess( [], [1] )
True
>>> lexLess( [2], [1] )
False

"""

def lexLess( L1, L2 ):
    # Assume L1 and L2 are lists of integers.
    if not L1:
        return ( True if L2 else False )
    elif not L2:
        return False
    # What do I know at this point?
    elif L1[0] < L2[0]:
        return True
    elif L1[0] > L2[0]:
        return False
    # What do I know at this point?
    else:
        return lexLess( L1[1:], L2[1:] )

# As an exercise write the function lexLessEqual( L1, L2 )

#----------------------------------------------------------------------

# Write a recursive Boolean-valued function to recognize palindromes.

def isPalindromeHelper( s, low, high ):
    # print("low:", low, "high:", high)
    if low >= high:
        return True
    elif s[low] != s[high]:
        return False
    else:
        return isPalindromeHelper( s, low + 1, high - 1 )

def isPalindrome( s ):
    return isPalindromeHelper( s, 0, len(s) - 1 )


#----------------------------------------------------------------------

def findFirstUppercaseIndexHelper( s, index ):
   """ Helper function for findFirstUppercaseIndex.
   Return the offset of the first uppercase letter;
   assume you are starting at index. Return -1 
   if there is none."""
   print("String:", s, "index:", index)
   if not s:
       return -1
   elif s[0].isupper():
       return index
   else:
       return findFirstUppercaseIndexHelper( s[1:], index + 1 )

# The following function is already completed for you. But 
# make sure you understand what it's doing. 

def findFirstUppercaseIndex( s ):
   """ Return the index of the first uppercase letter in 
   string s, if any. Return -1 if there is none. This one 
   requires a helper function, which is the recursive 
   function. """
   return findFirstUppercaseIndexHelper( s, 0 )

