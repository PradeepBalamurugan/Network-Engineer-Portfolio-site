/**
 * Netlify Function proxy for /api/contact
 * Re-uses the unified handler in api/contact.js
 */
const { netlifyHandler } = require('../../api/contact');

exports.handler = netlifyHandler;
