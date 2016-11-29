/*global define, $, brackets, window, document, clearTimeout, setTimeout, localStorage */

define(function(req, exp, mod) {
    'use strict';

    // ms to wait before saving since last keypress
    var waitingPeriod = 400;

    var timerHandler       = 0,
        CommandManager     = brackets.getModule("command/CommandManager"),
        Commands           = brackets.getModule('command/Commands'),
        Menus              = brackets.getModule("command/Menus"),
        KBM                = brackets.getModule("command/KeyBindingManager"),
        Editor             = brackets.getModule("editor/EditorManager"),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        autoSavePrefs      = PreferencesManager.getExtensionPrefs('autoSavePrefs'),
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
                //console.log(Editor.getFocusedEditor());
                if(Editor.getFocusedEditor() &&
                    event.keyIdentifier != 'Alt' &&
                    event.keyIdentifier != 'Shift' &&
                    event.keyIdentifier != 'Control' &&
                    event.keyIdentifier != 'Meta') {
                    // Saves the given file. If no file specified, assumes the current document.
                    CommandManager.execute(Commands.FILE_SAVE);
                }
            }, waitingPeriod);
        }
    });
});
