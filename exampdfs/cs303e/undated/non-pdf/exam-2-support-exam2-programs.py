# The programs from Versions A and C:

#  An n-digit base-10 number that is the sum of the nth powers of its
#  digits is called an Armstrong number. For example, consider
#  153. Since it's a 3-digit number, you add up the cubes (3rd powers)
#  of the digits and see if that sum equals the number.
# 
#          1**3 + 5**3 + 3**3 = 1 + 125 + 27 = 153
# 
#  Complete the function below that prints out in ascending order all
#  Armstrong numbers of 3 digits, i.e., in the range 100 to 999.
#  Here's the first few lines of sample behavior:
# 
# >>> print3DigitArmstrongNumbers()
# 153
# 370
# ...

def print3DigitArmstrongNumbers( ):
    for num in range(100, 1000):
        d0 = num % 10
        r1 = num // 10
        d1 = r1 % 10
        d2 = r1 // 10
        if num == (d0**3 + d1**3 + d2**3):
            print( num )

# Try to write the more general function, isArmstrongNumber(n)
# where n is assumed to be a positive integer. 

def isArmstrongNumber( n ):
    """Check whether n is an Armstrong Number."""
    digits = []
    num = n
    # Collect the digits in n into a list.
    while num > 0:
        d = num % 10
        digits.append( d )
        num = num // 10
#   print(digits)
    # e is the length of n (number of digits).
    e = len( digits )
    sum = 0
    for d in digits:
        sum += (d**e)
    return sum == n

print("Armstrong numbers < 1000:")
for i in range(1000):
    if isArmstrongNumber(i):
        print(i)

#----------------------------------------------------------------------

# For some reason, Joe likes to keep all his cash in quarters.  Below
# and on the following page, fill in the class ChangePurse which keeps
# track of Joe's quarters. Note a dollar contains 4 quarters; each
# worth $0.25. There is no reason to format your output values, except
# to add the ``$". See sample usage below:

# >>> cp = ChangePurse( 10, 3 )      # initialize with $10.75, i.e., 
#                                    # 10 dollars and 3 quarters
# >>> print( cp )                    
# Value: $10.75
# >>> cp.getQuarterCount()           # all cash stored as quarters
# 43                                 
# >>> cp.addMoney( 5, 2 )            # add $5.50 
# >>> print( cp )
# Value: $16.25
# >>> cp.spendMoney( 20, 1)          # try to spend $20.25;
# You can't afford it!               # nothing changes in class
# >>> cp.spendMoney( 4, 5 )          # try to spend $4 + 5 quarters;
# >>> print( cp )                    # this succeeds
# Value: $11.0
# >>> cp.getQuarterCount()
# 44

class ChangePurse:
    def __init__(self, dollars = 0, quarters = 0):
        # Convert the number of dollars and quarters into a
        # number of quarters and store in a private attribute.  
        self.__quarters = dollars * 4 + quarters
        
    def __str__(self):
        # Generate a string used to print out the amount of money.
        # See the examples above.
        dollars = self.__quarters // 4
        change  = self.__quarters % 4
        return "Value: $" + str(dollars) + "." + str(change * 25)

    def getQuarterCount( self ):
        # Return the count of quarters stored.
        return self.__quarters

    def addMoney(self, dollars, quarters):
        # Add the money to the class object.  Remember to
        # convert everything to quarters. 
        self.__quarters += dollars * 4 + quarters

    def spendMoney(self, dollars, quarters):
        # Spend the designated amount, assuming Joe has
        # enough.  Print an error message otherwise.
        amt = dollars * 4 + quarters
        if self.__quarters < amt:
            print("You can't afford it!")
        else:
            self.__quarters -= amt

#----------------------------------------------------------------------
#----------------------------------------------------------------------
#----------------------------------------------------------------------

# The programs from Versions A and C:

# Twin primes are two prime numbers that differ by 2, e.g., 3 and 5.
# Assume you have available a function isPrime(n) that takes a
# positive integer n and returns True if n is prime, and False
# otherwise.  You must use this function in your solution.  Fill in
# the body of the function twinPrimes(k, num) below. It should print
# the first k pairs of twin primes beginning from num, one pair per
# line.  You can assume k and num are positive integers.  Below is
# some sample behavior:
# 
# >>> twinPrimes(4, 227)               >>> twinPrimes(2, 1000000)
# 227 229                              1000037 1000039
# 239 241                              1000211 1000213
# 269 271
# 281 283

import math

def twinPrimes( k, start ):
   """Find k twin primes at least as large as start."""
   pairsFound = 0
   n = (start if start%2 else start+1)
   while pairsFound < k:
      if isPrime( n ) and isPrime( n+2 ):
         print( n, n+2 )
         pairsFound += 1
      n += 2

def isPrime( num ):
   """ Test whether num is prime. """
   # Deal with the even numbers
   if (num < 2 or num % 2 == 0 ):
      return ( num == 2 )
   # See if there are any odd divisors 
   # less than the square root of num.
   divisor = 3
   while (divisor <= math.sqrt( num )):
      if ( num % divisor == 0 ):
         return False
      else:
         divisor += 2
   return True

#----------------------------------------------------------------------

# Your bank has an odd ATM in their lobby: it only deals with $10 and
# $20 bills.  So the initial amount of cash inside, cash added, or
# cash withdrawn must be a multiple of 10. (It's fine to model this
# with integers, rather than floats.)  If the user tries to initialize
# with an illegal amount, print an error message and store a balance
# of $0. For a withdrawal, if the balance is not sufficient, print an
# error message but don't change the balance. If sufficient, decrement
# the balance by the amount.  On a withdrawal also print out the
# number of twenties and tens delivered; maximize the number of
# twenties to minimize the total number of bills. (Assume that always
# works; don't worry about the number of twenties/tens in the
# machine.)  Model this by filling in the ATM class below.  Here's
# some sample behavior:
# 
# >>> atm1 = ATM( 25 )
# Amount must be a multiple of 10.
# >>> print( atm1 )
# Current balance: $0
# >>> atm = ATM( 100 )
# >>> print( atm )
# Current balance: $100
# >>> atm.addCash( 75 )
# Amount must be a multiple of 10.
# >>> atm.addCash( 70 )
# >>> print( atm )
# Current balance: $170
# >>> atm.withdraw( 35 )
# Amount must be a multiple of 10.
# >>> atm.withdraw( 180 )
# Balance not sufficient.
# >>> atm.withdraw( 150 )
# Dispensing: 7 twenties and 1 tens
# >>> print(atm)
# Current balance: $20
# >>> atm.withdraw( 20 )
# Dispensing: 1 twenties and 0 tens
# >>> print(atm)
# Current balance: $0
# >>> 

class ATM:
    def __init__(self, amt):
       """Initialize the ATM with the cash amt, which must be
       divisible by 10. Otherwise initialize to 0. Store balance
       in a private attribute."""
       if (amt % 10 != 0):
           print("Amount must be multiple of 10.")
           self.__balance = 0
       else:
           self.__balance = amt
         
    def __str__(self):
        """Return string describing the current balance."""
        return "Current balance: $" + str(self.__balance)

    def addCash(self, amt):
        """Add cash amt to the ATM. The amt must be a multiple of 10."""
        if (amt % 10 != 0):
            print("Amount must be multiple of 10.")
        else:
            self.__balance += amt

    def withdraw(self, amt):
        """Withdraw amt from ATM, if amt is divisible by 10 and the
        current balance is sufficient.  If so, decrement the balance
        and report the number of tens and twenties delivered. Maximize
        the number of twenties."""
        if (amt % 10 != 0):
            print("Amount must be multiple of 10.")
        elif (amt > self.__balance):
            print("Balance not sufficient.")
        else:
            amtWithdraw = amt
            twenties = amtWithdraw // 20
            amtWithdraw -= twenties * 20
            tens = amtWithdraw // 10
            print("Dispensing:", twenties, "twenties and", tens, "tens")
            self.__balance -= amt

