const RESERVED_WORDS = new Set([
    "shorten",
    "analytics",
    "top",
    "login",
    "signup",
    "admin"
]);

function validateAndNormalizeAlias(alias) {
    if (!alias) return { valid: true, alias: null };

    const normalized = alias.toLowerCase();

    if (normalized.length < 3 || normalized.length > 30) {
        return {
            valid: false,
            error: "Alias must be between 3 and 30 characters"
        };
    }

    const isValidFormat = /^[a-zA-Z0-9_-]+$/.test(normalized);
    if (!isValidFormat) {
        return {
            valid: false,
            error: "Alias can only contain letters, numbers, - and _"
        };
    }

    if (RESERVED_WORDS.has(normalized)) {
        return {
            valid: false,
            error: "This alias is reserved"
        };
    }

    return {
        valid: true,
        alias: normalized
    };
}

module.exports = validateAndNormalizeAlias;