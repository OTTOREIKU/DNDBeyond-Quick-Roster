# D&amp;D Beyond Quick Roster
*Creates a floating button inside roll20 to add D&amp;D Beyond character sheets *+extras* inside of a roll20 campaign*
--  
<img width="1491" height="860" alt="DDQR-1" src="https://github.com/user-attachments/assets/b4bdf320-1b4e-47fd-8d77-ad1af051bee9" />  
--  
<img width="1554" height="862" alt="DDQR-2" src="https://github.com/user-attachments/assets/d6cd1b6d-babf-4d11-8491-527e2c9ea113" />  
--  
  




VERSIONS:  

31.0 - D&D Beyond character sheets, Roll20 character sheets *(WIP)*, Floating Notepad, Initiative Tracker, 5eTools database, NotelookLM shortcut, and Import/Export party function
  
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
b) Inside of Tampermonkey's Dashboard make sure Allow Userscripts is enabled in the settings *(this may have to be enabled after you install the script)*
  
4 - [Download](https://github.com/OTTOREIKU/DNDBeyond-Quick-Roster/releases) the most recent script and add it to Tampermonkey. Make sure that it is enabled inside of the Installed Usercsripts section  

The next time you load up/enter a campaign inside of roll20 a new D&D Beyond button should be visible on the screen
  
--  

How to use:    

**There are settings toggles for every extra function of the tool so you can turn off/on anything you wish to use or not use**  
**most are off by default**  
  
- Make sure your D&D Beyond character sheet is set to public  

- Copy the URL to your sheet, click the D&D Beyond button inside roll20, paste the URL into the box and hit add character (rename the default character ID if you want)

- click the new name that appears above the button and it will open the sheet(s)
  
- If you wish to share a preset group of characters hit the share/copy button and then to input that string, you hit the import button and then paste it into the new popup
  
- Autorefresh is off so the first time you load a character sheet it will load the page but afterwards it will be instant flipping between multiple. If changes are made to a sheet, you need to turn Autorefresh ON and then switching back to the sheet will load it again

- The PIN button pins the red button in place on screen, the LOCK button locks the setting from being opened when you're moving it around (or you can use middle mouse to move it)

- If the 'Auto-Track Chat' setting is on any initiative roll inside of that chat window should be recorded and added/updated to the tracker  

- To add a roll20 sheet you must have permissions to edit/view the sheet. Then you open the sheet and click the popout button in the top right. The new character sheet window that opens should now have some floating buttons to cache the page. You need to click each tab of the character sheet (Comabt, Spells, Inventory, etc) and hit the '+capture view' button at the top to record the info found on each. Then click 'save & close' to save the sheet to the master window

<img width="42" height="37" alt="RSH1" src="https://github.com/user-attachments/assets/b42cff01-6e18-4418-9457-0d531e6a7141" />
<img width="321" height="52" alt="RS2" src="https://github.com/user-attachments/assets/2dfb9461-e65f-428c-829b-d83e62c134dd" />
<img width="593" height="82" alt="RS3" src="https://github.com/user-attachments/assets/16da933c-a743-4b43-a242-cb22219905ec" />
