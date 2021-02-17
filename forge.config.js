module.exports = {
  "packagerConfig": {
    "icon": "static/icon.icns",
    "name": "Idyll Studio",
    "osxSign": {
      "entitlements": "static/entitlements.plist",
      "entitlements-inherit": "static/entitlements.plist",
      "gatekeeper-assess": false,
      "hardenedRuntime": true,
      "identity": "Developer ID Application: Matthew Conlen (9NELR4LFNY)"
    },
    "osxNotarize": {
      "appleId": process.env['APPLE_ID'],
      "appleIdPassword": process.env['APPLE_ID_PASSWORD']
    }
  },
  "makers": [
    {
      "name": "@electron-forge/maker-squirrel",
      "config": {
        "name": "idyll_studio",
        "setupIcon": "static/icon.ico",
        "iconUrl": "https://static/icon.png"
      }
    },
    {
      "name": "@electron-forge/maker-zip",
      "platforms": [
        "darwin"
      ]
    },
    {
      "name": "@electron-forge/maker-deb",
      "config": {}
    },
    {
      "name": "@electron-forge/maker-rpm",
      "config": {}
    }
  ]
}

