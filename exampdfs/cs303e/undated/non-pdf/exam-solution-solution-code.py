########################################################################
#                                                                      #
#                             Caesar Cipher                            #
#                                                                      #
########################################################################

# Given a string encode and decode it using a Caesar Cipher.

import random

def isLegalShiftValue( k ):
    return ( 0 <= k < 26 )

def shiftLCLetter( char, k ):
    """This implements the Caesar Cipher shift on a single character.
    Assume that char is a lower case letter and k is a legal shift
    value.

    """
    index = ( (ord(char) - ord('a') + k) % 26 ) + ord('a')
    return chr( index )
    
def shiftUCLetter( char, k ):
    """This implements the Caesar Cipher shift on a single character.
    Assume that char is an upper case letter and k is a legal shift
    value.

    """
    index = ( (ord(char) - ord('A') + k) % 26 ) + ord('A')
    return chr( index )
    
def shiftCharacter( char, k ):
    """This implements the Caesar Cipher shift on a single letter.
    Assume that char is a letter and k is a legal shift value.
    """
    if not char.isalpha():
        return char
    aOrA = ( 'A' if char.isupper() else 'a' )
    index = ( (ord(char) - ord( aOrA ) + k) % 26 ) + ord( aOrA )
    return chr( index )

def convertText( text, k ):
    """This converts an entire text using the Caesar Cipher with shift
    value k.  Convert only letter, leaving non-letters unchanged.

    """
    newText = ""
    for ch in text:
        newChar = shiftCharacter( ch, k )
        newText += newChar
    return newText

class CaesarCipher:
    def __init__ (self, k ):
        if (isLegalShiftValue( k )):
            self.__shiftValue = k
        else:
            print( "Shift value entered is not legal" )

    def getShiftValue( self ):
        return self.__shiftValue

    def encryptText( self, text ):
        return convertText( text, self.__shiftValue )

    def decryptText( self, text ):
        return convertText( text, 26 - self.__shiftValue )


def main():
    """ Handles encrypting and decrypting by Caesar Cipher.  The 
        encrypt/decrypt command, shift value, and text are input
        by the user.  """

    # Accept user command to encrypt or decrypt:
    command = input( "Enter Caesar cipher command (encrypt/decrypt): " )
    command = command.lower().strip()
    
    # Recognize the command if it begins with "enc" or "dec"
    if not ( command.startswith("enc") or command.startswith("dec") ):
        print( "Unrecognized command:", command )
        return

    # Which is it?
    isEncrypt = ( command.startswith("enc") )
    encOrDecString = "You've asked to " + ("encrypt." if isEncrypt else "decrypt.")
    print( encOrDecString )

    # Accept shift value:
    shiftValue = int( input( "Please enter shift value (0 .. 25): ") )
    if not isLegalShiftValue( shiftValue ):
        print( "Illegal shift value:", shiftValue )
        return

    # Accept text:
    text = input( "Please enter text to " + command + ": " )

    # Create a new CaesarCipher object to perform the operation:
    cc = CaesarCipher( shiftValue )

    # Apply the Caesar Cipher to the input text:
    if isEncrypt:
        newText = cc.encryptText( text )
        print( "The encrypted text is:\n" + newText )
    else:
        newText = cc.decryptText( text )
        print( "The decrypted text is:\n" + newText )

main()

