# Security Issue: Cleartext cookies

#security #cookie #http

Reported here: <https://github.com/wtasg/meetonline/security/code-scanning/1>

Refer further:

- [Missing Encryption of Sensitive Data](https://cwe.mitre.org/data/definitions/311.html) The product does not encrypt sensitive or critical information before storage or transmission.
- [Cleartext Storage of Sensitive Information](https://cwe.mitre.org/data/definitions/312.html) The product stores sensitive information in cleartext within a resource that might be accessible to another control sphere.
- [Cleartext Transmission of Sensitive Information](https://cwe.mitre.org/data/definitions/319.html) The product transmits sensitive or security-critical data in cleartext in a communication channel that can be sniffed by unauthorized actors.
- [Sensitive Cookie in HTTPS Session Without 'Secure' Attribute](https://cwe.mitre.org/data/definitions/614.html) The Secure attribute for sensitive cookies in HTTPS sessions is not set, which could cause the user agent to send those cookies in plaintext over an HTTP session.
- ExpressJS: [Use cookies securely](https://expressjs.com/en/advanced/best-practice-security.html#use-cookies-securely).
- OWASP: [Set cookie flags appropriately](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#set-cookie-flags-appropriately).
- Mozilla: [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie).

---

1. Run the application. See it for yourself.
2. Update offending code in server.
3. Run server and see app breaking.
4. Update client code and see app working again with secure settings.
