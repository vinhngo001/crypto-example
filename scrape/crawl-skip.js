const wordsRelated = [
    "sign-in", "signin", "login", "sing_in",
    "sign-up", "register", "signup", "sign_up", "logout",
    "not found", "page not found", "404", "not-found", "not_found", "page-not-found", "page_not_found",
    "contact us", "contact-us", "contact_us", "about-us", "about_us", "about us",
    "logo", "brand", "banner",
    "not-allowed", "access-denied", "not allowed", "access denied", "not_allowed", "access_denied", 
    "privacy-policy", "privacy_policy", "privacy policy", "empty-page", "empty_page", "empty page",
    "terms-and-conditions", "terms_and_conditions", "terms and conditions"
    // "size=", "sort=", "color="
];

const sessionRelated = [
    "jsessionid",
    "PHPSESSID",
    "SID",
    "session_id",
    "sessionid",
    "auth",
    "token",
    "session"
];

const timeRelated = [
    "calendar",
    "schedule", "events", "timeline", "agenda",
    "date", "month", "year", "time",
    "history",
    "archives"
];

const subdomainRelated = [
    "blog",
    "shop",
    "forum",
    "mail",
    "account",
    "sub"
];

const parametersRelated = [
    // Language and Region
    "lang",
    "locale",
    "region",

    // Currency
    "currency",
    "price_currency",

    // Product-related
    "product_id",
    "sku",
    "item_id",

    // Search and Filters
    "query",
    "search",
    "filter",
    "sort",

    // Tracking and Analytics
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "ref",
    "source",

    // Content Versioning
    "version",
    "revision",
    "date",

    // User and Session
    "user_id",
    "session_id",

    // Custom Campaign Codes
    "campaign_id",
    "promo_code",

    // Page
   'page'
];

const languages = [
    'eng'
];

module.exports = {
    crawlSkipWords: wordsRelated,
    crawlSkipSessionKeyWords: sessionRelated,
    crawlSkipTimeKeywords: timeRelated,
    crawlSkipSubdomainKeyWords: subdomainRelated,
    relevantParameters: parametersRelated,
    languagesRelated: languages,
    // crawlSkipFileSize: fileSizeDefault
};