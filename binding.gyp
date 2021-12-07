{
  "targets": [
    {
      "target_name": "autotype",
      "conditions": [
	      ['OS == "mac"', {
		      'include_dirs': [
            'System/Library/Frameworks/CoreFoundation.Framework/Headers',
            'System/Library/Frameworks/Carbon.Framework/Headers',
          ],
          "sources": [ "src/addons/autotype_macos.cc" ],
          "link_settings": {
            "libraries": [
              "-framework Carbon",
              "-framework CoreFoundation"
            ]
          }
        }]
      ],
      
    }
  ],
}