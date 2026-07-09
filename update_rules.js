const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  /function isAdmin\(\) \{\s*return isSignedIn\(\) && \(\s*\(request\.auth\.token\.email\.matches\('\(\?i\)infowarspakistan@gmail\\\\\.com'\)\) \|\|\s*\(request\.auth\.token\.email\.matches\('\(\?i\)infowarspakistan@gmail\\\\\.cin'\)\) \|\|\s*\(exists\(\/databases\/\$\(database\)\/documents\/users\/\$\(request\.auth\.uid\)\) &&\s*get\(\/databases\/\$\(database\)\/documents\/users\/\$\(request\.auth\.uid\)\)\.data\.role == 'admin'\)\s*\);\s*\}/,
  `function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email == 'infowarspakistan@gmail.com' ||
        request.auth.token.email == 'infowarspakistan@gmail.cin' ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
    }`
);
fs.writeFileSync('firestore.rules', rules);
