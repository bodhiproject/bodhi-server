module.exports = {
  "extends": "airbnb",
  "env": {
    "node": true,
    "mocha": true
  },
  "parserOptions": {
    "ecmaVersion": 8,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "class-methods-use-this": [0
    ],
    "consistent-return": 0,
    "max-len": [2,
      {
        "code": 120,
        "ignoreComments": true,
        "ignoreUrls": true,
        "ignoreStrings": true
      }
    ],
    "no-console": 0,
    "no-param-reassign": [2,
      {
        "props": false
      }
    ],
    "no-plusplus": [0
    ],
    "no-underscore-dangle": [2,
      {
        "enforceInMethodNames": true
      }
    ],
    "no-use-before-define": [2,
      {
        "functions": false,
        "classes": false
      }
    ],
    "no-unused-vars": [1,
      {
        "args": "none",
        "caughtErrors": "none"
      }
    ],
    "object-property-newline": [2,
      {
        "allowAllPropertiesOnSameLine": true
      }
    ],
    "object-curly-newline": [0,
      {
        "ImportDeclaration": "never",
      }
    ],
    "prefer-destructuring": [0
    ]
  }
};
