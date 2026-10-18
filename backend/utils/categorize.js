const categorize = (description) => {
    const d = description.toLowerCase();

    // Food & Dining
    if (d.includes('swiggy') || d.includes('zomato') || d.includes('dominos') ||
        d.includes('pizza') || d.includes('mcdonald') || d.includes('kfc') ||
        d.includes('burger') || d.includes('dunkin') || d.includes('starbucks') ||
        d.includes('restaurant') || d.includes('cafe') || d.includes('food') ||
        d.includes('bakery') || d.includes('kitchen') || d.includes('eat') ||
        d.includes('dining') || d.includes('biryani') || d.includes('hotel'))
        return 'Food & Dining';

    // Travel & Transport
    if (d.includes('uber') || d.includes('ola') || d.includes('rapido') ||
        d.includes('irctc') || d.includes('railway') || d.includes('flight') ||
        d.includes('airline') || d.includes('indigo') || d.includes('air india') ||
        d.includes('spicejet') || d.includes('makemytrip') || d.includes('goibibo') ||
        d.includes('redbus') || d.includes('bus') || d.includes('metro') ||
        d.includes('petrol') || d.includes('fuel') || d.includes('parking') ||
        d.includes('toll') || d.includes('fastag') || d.includes('cab'))
        return 'Travel & Transport';

    // Shopping
    if (d.includes('amazon') || d.includes('flipkart') || d.includes('myntra') ||
        d.includes('meesho') || d.includes('ajio') || d.includes('nykaa') ||
        d.includes('snapdeal') || d.includes('shopify') || d.includes('retail') ||
        d.includes('mart') || d.includes('store') || d.includes('shop') ||
        d.includes('mall') || d.includes('market') || d.includes('bazaar'))
        return 'Shopping';

    // Subscriptions & Entertainment
    if (d.includes('netflix') || d.includes('spotify') || d.includes('prime') ||
        d.includes('hotstar') || d.includes('disney') || d.includes('youtube') ||
        d.includes('apple') || d.includes('google play') || d.includes('steam') ||
        d.includes('xbox') || d.includes('playstation') || d.includes('subscription') ||
        d.includes('membership') || d.includes('jiocinema') || d.includes('sonyliv'))
        return 'Subscriptions & Entertainment';

    // Bills & Utilities
    if (d.includes('electricity') || d.includes('water') || d.includes('gas') ||
        d.includes('wifi') || d.includes('broadband') || d.includes('airtel') ||
        d.includes('jio') || d.includes('bsnl') || d.includes('vi ') ||
        d.includes('recharge') || d.includes('mobile bill') || d.includes('utility') ||
        d.includes('ebill') || d.includes('bescom') || d.includes('tneb'))
        return 'Bills & Utilities';

    // Health & Medical
    if (d.includes('pharmacy') || d.includes('medical') || d.includes('hospital') ||
        d.includes('clinic') || d.includes('doctor') || d.includes('apollo') ||
        d.includes('medplus') || d.includes('netmeds') || d.includes('1mg') ||
        d.includes('pharmeasy') || d.includes('health') || d.includes('lab') ||
        d.includes('diagnostic') || d.includes('insurance') || d.includes('wellness'))
        return 'Health & Medical';

    // Education
    if (d.includes('udemy') || d.includes('coursera') || d.includes('unacademy') ||
        d.includes('byju') || d.includes('college') || d.includes('university') ||
        d.includes('school') || d.includes('tuition') || d.includes('course') ||
        d.includes('exam') || d.includes('fees') || d.includes('educat'))
        return 'Education';

    // Groceries
    if (d.includes('blinkit') || d.includes('zepto') || d.includes('bigbasket') ||
        d.includes('instamart') || d.includes('dmart') || d.includes('grocer') ||
        d.includes('supermarket') || d.includes('vegetables') || d.includes('fruits') ||
        d.includes('dairy') || d.includes('milk') || d.includes('reliance fresh'))
        return 'Groceries';

    // Finance & Banking
    if (d.includes('emi') || d.includes('loan') || d.includes('interest') ||
        d.includes('credit card') || d.includes('mortgage') || d.includes('insurance') ||
        d.includes('mutual fund') || d.includes('sip') || d.includes('investment') ||
        d.includes('zerodha') || d.includes('groww') || d.includes('upstox') ||
        d.includes('neft') || d.includes('imps') || d.includes('transfer'))
        return 'Finance & Banking';

    // Cash & ATM
    if (d.includes('atm') || d.includes('withdrawal') || d.includes('cash'))
        return 'Cash & ATM';

    // Income
    if (d.includes('salary') || d.includes('payroll') || d.includes('deposit') ||
        d.includes('credit') || d.includes('refund') || d.includes('cashback') ||
        d.includes('reward') || d.includes('bonus') || d.includes('freelance'))
        return 'Income';

    // Personal Care
    if (d.includes('salon') || d.includes('spa') || d.includes('haircut') ||
        d.includes('beauty') || d.includes('grooming') || d.includes('laundry'))
        return 'Personal Care';

    return 'Uncategorized';
};

module.exports = categorize;