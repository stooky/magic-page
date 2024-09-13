#!/bin/bash

# Define the list of packages to install
PACKAGES=(
  "@types/node@20.14.2"
  "@types/react-dom@18.3.0"
  "@types/react@18.3.3"
  "asynckit@0.4.0"
  "axios@1.7.2"
  "buffer-equal-constant-time@1.0.1"
  "combined-stream@1.0.8"
  "cookie@0.6.0"
  "data-uri-to-buffer@4.0.1"
  "delayed-stream@1.0.0"
  "ecdsa-sig-formatter@1.0.11"
  "eslint-config-next@14.2.3"
  "eslint@8.57.0"
  "fetch-blob@3.2.0"
  "follow-redirects@1.15.6"
  "form-data@4.0.0"
  "formdata-polyfill@4.0.10"
  "js-cookie@3.0.5"
  "jsonwebtoken@9.0.2"
  "jwa@1.4.1"
  "jws@3.2.2"
  "lodash.includes@4.3.0"
  "lodash.isboolean@3.0.3"
  "lodash.isinteger@4.0.4"
  "lodash.isnumber@3.0.3"
  "lodash.isplainobject@4.0.6"
  "lodash.isstring@4.0.1"
  "lodash.once@4.1.1"
  "mime-db@1.52.0"
  "mime-types@2.1.35"
  "next@14.2.3"
  "node-domexception@1.0.0"
  "node-fetch@3.3.2"
  "postcss@8.4.38"
  "proxy-from-env@1.1.0"
  "react-dom@18.3.1"
  "react@18.3.1"
  "safe-buffer@5.2.1"
  "tailwindcss@3.4.4"
  "typescript@5.4.5"
  "uuid@10.0.0"
  "web-streams-polyfill@3.3.3"
  "express"
  "pg"
  "dotenv"
)

# Loop through the list and install each package
for PACKAGE in "${PACKAGES[@]}"; do
  echo "Installing $PACKAGE..."
  npm install "$PACKAGE" --save
done

echo "All packages have been installed."

