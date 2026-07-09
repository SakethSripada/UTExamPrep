# These are possible answers for the two programming problems for
# Exam1, Spring 2025.

#   1. The Valero station on Manor Road
#   discounts their gas if you use a Valero credit card.  The discount
#   varies over time.  I also have a Visa card that returns 3% on gas
#   purchases.  The best deal depends on the current price and the
#   discount.  Write on the next page the code you'd put in file 
#   gasPurchase.py to tell me which card to use, as in the example
#   below. First ask for the price per gallon (in dollars) and the
#   Valero discount (in dollars). Then print out the price per gallon
#   using each card, with three digits after the decimal point.
#   Finally, say which is the better deal, printing ``Use Valero card!''
#   or ``Use Visa card!''.  If there's a tie, you can print either.
#   Here's some sample behavior. Note that the first 2 lines are to get
#   the user input; the last 3 are the report.  There is a blank line
#   between. You don't have to validate inputs. 
#
# > python gasPurchase.py
# Price per gallon: 2.499                         # ask for user input
# Valero discount: 0.10                           # ask for user input
# 
# Valero price: $2.399
# Visa price: $2.424
# Use Valero card!

def buyGas():
    # Get the two input values:
    pricePerGallon = float( input( "Price per gallon: ") )
    valeroDiscount = float( input( "Valero discount: ") )

    # The Valero price is the price per gallon minus the Valero
    # discount.
    valeroPrice = pricePerGallon - valeroDiscount
    print( "\nValero price: $", format(valeroPrice, ".3f"), sep="")

    # The Visa price is the price per gallon - 3% of the price per gallon
    visaPrice = pricePerGallon * 0.97
    print( "Visa price: $", format(visaPrice, ".3f"), sep="")

    if valeroPrice < visaPrice:
        print( "Use Valero card!" )
    else:
        print( "Use Visa card!" )

# buyGas()



#   2. Write code you could put in file
#   computetaxes.py to compute an employee's taxes. First ask for
#   the hours worked, hourly pay, and tax rate (all are floats).
#   Compute the gross pay (hours worked times the hourly pay).  If the
#   gross pay is less than or equal to
#   $50.00 there are no taxes; otherwise, the tax is the gross
#   pay times the tax rate.  The net pay is the gross pay minus the tax.
#   Report all dollar amounts with two digits after the decimal point.
#   Write a report following two samples below.  Note, the first 3 lines
#   are for user input; the last 4 are the report. There is a blank line
#   between. You don't have to validate inputs. 
#
# > python computeTaxes.py              > python computeTaxes.py
# Hours worked: 10                      Hours worked: 2
# Hourly pay: 9.75                      Hourly pay: 10.00
# Tax rate: 0.25                        Tax rate: 0.20
# 
# Pay report                            Pay report
#   Gross Pay: $97.50                     Gross Pay: $20.00
#   Tax: $24.38                           Tax: $0.00
# Net Pay: $73.12                       Net Pay: $20.00

def computeTax():
    # Get hours worked:
    hoursWorked = float( input( "Hours worked: " ))
    
    # Get hourly pay:
    hourlyPay = float( input( "Hourly pay: " ))

    # Get tax rate:
    taxRate = float( input( "Tax rate: " ))

    # Compute gross pay:
    grossPay = hoursWorked * hourlyPay

    # Compute tax:
    if grossPay <= 50.00:
        tax = 0.0
    else:
        tax = grossPay * taxRate

    # You could also do the above as:
    # tax = (0.0 if grossPay <= 50.00 else grossPay * taxRate)

    netPay =  grossPay - tax

    # Print report:
    print( "\nPay report:" )
    print( "  Gross pay: $", format( grossPay, ".2f" ), sep="" )
    print( "  Tax: $", format( tax, ".2f" ), sep="" )
    print( "Net pay: $", format( netPay, ".2f" ), sep='' )
    
computeTax()
