/*global define, $, brackets, window, document, clearTimeout, setTimeout, localStorage */

define(function(req, exp, mod) {
    'use strict';

    // Amount of ms to wait before saving since last keypress
    var waitingPeriod = 400;
    var keysToIgnore  = ['Alt', 'Shift', 'Control', 'Meta'];
    var timerHandler  = 0;

    // Load all needed modules and other stuff
    var CommandManager     = brackets.getModule("command/CommandManager"),
        Commands           = brackets.getModule("command/Commands"),
        Menus              = brackets.getModule("command/Menus"),
        KBM                = brackets.getModule("command/KeyBindingManager"),
        Editor             = brackets.getModule("editor/EditorManager"),
        CodeHintMgr        = brackets.getModule("editor/CodeHintManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        autoSavePrefs      = PreferencesManager.getExtensionPrefs("autoSavePrefs"),
        autoSaveOnSave     = autoSavePrefs.get('on_save') || false,
        autosave_id        = 'pref_auto',
        commandOnSave      = CommandManager.register('Enable auto saving', autosave_id, function() {
            toggle(this, !this.getChecked());
        });
    if(!autoSaveOnSave) {
        commandOnSave.setChecked(false);
        autoSavePrefs.set('on_save', false);
        autoSavePrefs.save();
    } else {
        commandOnSave.setChecked(true);
    }

    Menus.getMenu(Menus.AppMenuBar.FILE_MENU).addMenuItem(autosave_id, null, Menus.LAST_IN_SECTION, Menus.MenuSection.FILE_SAVE_COMMANDS);

    function toggle(command, fromCheckbox) {
        var newValue = (typeof fromCheckbox === 'undefined') ? autoSaveOnSave : fromCheckbox;
        command.setChecked(newValue);
        autoSavePrefs.set('on_save', newValue);
        autoSavePrefs.save();
    }

    KBM.addGlobalKeydownHook(function(event) {
        if(autoSavePrefs.get('on_save')) {
            if(timerHandler) clearTimeout(timerHandler);
            timerHandler = setTimeout(function() {
                // If main editor is focused and code hint modal not showing and control keys not pressed
                if(Editor.getFocusedEditor() && !CodeHintMgr.isOpen() && keysToIgnore.indexOf(event.keyIdentifier) == -1) {
                    // We save the given file. If no file specified, assumes the current document.
                    CommandManager.execute(Commands.FILE_SAVE);
                }
            }, waitingPeriod);
        }
    });
});
