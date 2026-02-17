# D&amp;D Beyond Quick Roster
*Creates a floating button on roll20 to add in character sheets from D&amp;D Beyond to reference inside of a roll20 campaign*
--  

![IMG1](https://github.com/user-attachments/assets/6fced97a-c0d5-46db-b890-66238b9f8156)


VERSIONS:  

25 - base   
26 - base + 5eTools button  
(*5etools is a [mirror](https://github.com/OTTOREIKU/5etools-Trevelyan) I am hosting for compatibility*)

Required extensions:  

**[Beyond 20]**  
Chrome: https://chromewebstore.google.com/detail/beyond-20/gnblbpbepfbfmoobegdogkglpbhcjofh?hl=en&pli=1  
Firefox: https://addons.mozilla.org/en-US/firefox/addon/beyond-20/  

**[Tampermonkey]**  
Chrome: https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en  
Firefox: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/  

**[Ignore X-Frame-Options]**  
Chrome: https://chromewebstore.google.com/detail/ignore-x-frame-options/ammjifkhlacaphegobaekhnapdjmeclo?hl=en  
Firefox: https://addons.mozilla.org/en-US/firefox/addon/ignore-x-frame-options-header/  


--  

Installation steps:  
*(Chrome users will need to enable Developer mode inside of the browser settings)*  
  
1 - Install Beyond20. This allows you to take rolls from D&DBeyond and post them in the roll20 chat
  
2 - Install X Frame Options. Make sure the correct permissions are given and that the tool is enabled
  
3 - Install Tampermonkey.  
a) Inside of your browser extension settings make sure it has all of the required permissions  
b) Inside of Tampermonkey's Dashboard make sure Allow Userscripts is enabled in the settings  
  
4 - [Download](https://github.com/OTTOREIKU/DNDBeyond-Quick-Roster/releases/tag/V1) the version of the script you want and add it to Tampermonkey. Make sure that it is enabled inside of the Installed Usercsripts section  

The next time you load up/enter a campaign inside of roll20 a new D&D Beyond button should be visible on the screen
  
--  

How to use:  
- Make sure your character sheet is set to public  

- Copy the link to your sheet, click the D&D Beyond button, paste the URL into the box and hit add character (rename the default character ID if you want)

- click the new name that appears above the button and it will open the sheet(s)
  
- If you wish to share a preset group of characters hit the share/copy button and then to input that string you hit the import button and then paste it into the new popup
  
- Autorefresh is off so the first time you load a character sheet it will load the page but afterwards it will be instant flipping between multiple. If changes are made to a sheet, you need to turn Autorefresh ON and then switching back to the sheet will load it again

- The PIN button pins the red button in place on screen, the LOCK button locks the setting from being opened when you're moving it around (or you can use middle mouse to move it)
