/*global define, $, brackets, window, document, clearTimeout, setTimeout, localStorage */

define(function(require, exp, mod) {
    'use strict';

    /* --- CONFIGURATION --- */
    var localcfg = {
        time        : 400,       // Amount of ms to wait by default
        max         : 1000000,   // max waiting ms in config
        min         : 50,        // min value ms in config
        keysToIgnore: ['Alt', 'Shift', 'Control', 'Meta'],
        timerHandler: 0
    };


    /* MODULE LOADING */
    var CommandManager     = brackets.getModule("command/CommandManager"),
        Commands           = brackets.getModule("command/Commands"),
        Dialogs            = brackets.getModule("widgets/Dialogs"),
        Menus              = brackets.getModule("command/Menus"),
        KBM                = brackets.getModule("command/KeyBindingManager"),
        Editor             = brackets.getModule("editor/EditorManager"),
        CodeHintMgr        = brackets.getModule("editor/CodeHintManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        Mustache           = brackets.getModule("thirdparty/mustache/mustache");

    /* DIALOG HTML LOAD */
    var dialogTemplate = require("text!html/dialog.html");

    /* HANDLERS MIX */
    var checkedPrefs        = 'checkedPrefs',
        timePrefs           = 'timePrefs',
        autoSavePrefs       = PreferencesManager.getExtensionPrefs("autoSavePrefs"),    // Works as a namespace of sorts for the extension
        isAutoSaveActivated = autoSavePrefs.get(checkedPrefs) || false,                 // This consults on prefs file the value 'autoSavePrefs.checkedPrefs'
        autosaveCommandName = 'autoSave_toggle',                                        // The command name for the check
        dialogCommandName   = 'autoSave_config';                                        // The command name for the config dialog

    localcfg.time = autoSavePrefs.get(timePrefs) || localcfg.time;


    /* COMMAND OBJECTS WITH STRINGS AND EXECUTION */
    var commandOnClickTheCheckBox = CommandManager.register('Enable autosave (' + msOrS(localcfg.time) + ')', autosaveCommandName,
        function() {
            toggle(this, !this.getChecked())
        });
    var commandOnClickConfig      = CommandManager.register('Autosave config', dialogCommandName,
        function() {
            // var lastFocus    = window.document.activeElement;
            var $dialogHndlr = Dialogs.showModalDialogUsingTemplate(Mustache.render(dialogTemplate, localcfg.time));
            var $text        = $("div.file-filter-dialog.modal.instance.in > div.modal-body input"),
                $savebtn     = $("div.file-filter-dialog.modal.instance.in button.dialog-button.btn.primary"),
                $calculon    = $("p#calculon");
            $text.val(localcfg.time);
            $calculon.text("That's about " + msOrS($text.val()));
            $text.keyup(function() {
                if($text.val() < localcfg.min || $text.val() > localcfg.max || isNaN($text.val())) {
                    $savebtn.prop('disabled', true);
                } else {
                    $calculon.text("That's about " + msOrS($text.val()));
                    $savebtn.prop('disabled', false);
                }
            });
            $dialogHndlr.done(function(buttonId) {
                if(buttonId === Dialogs.DIALOG_BTN_OK) {
                    // Saving out of the dialog
                    autoSavePrefs.set(timePrefs, parseInt($text.val()));
                    localcfg.time = parseInt($text.val());
                    commandOnClickTheCheckBox.setName('Enable autosave (' + msOrS(localcfg.time) + ')');
                }
                // lastFocus.focus();  // restore focus to old pos
            });
        });

    /* LOAD CONFIG PREFS TO BRACKETS */
    if(!isAutoSaveActivated) {
        commandOnClickTheCheckBox.setChecked(false);
        autoSavePrefs.set(checkedPrefs, false);
        autoSavePrefs.save();
    } else {
        commandOnClickTheCheckBox.setChecked(true);
    }


    /* ITEM POSITIONING IN THE FILE MENU */
    Menus.getMenu(Menus.AppMenuBar.FILE_MENU).addMenuItem(autosaveCommandName, null, Menus.LAST_IN_SECTION, Menus.MenuSection.FILE_SAVE_COMMANDS);
    Menus.getMenu(Menus.AppMenuBar.FILE_MENU).addMenuItem(dialogCommandName, null, Menus.LAST_IN_SECTION, Menus.MenuSection.FILE_SAVE_COMMANDS);


    /* KEY EVENT LISTENER */
    KBM.addGlobalKeydownHook(function(event) {
        // Listening to all keydown events and check if we have to save or not
        if(autoSavePrefs.get(checkedPrefs)) {
            if(localcfg.timerHandler) clearTimeout(localcfg.timerHandler);
            localcfg.timerHandler = setTimeout(function() {
                // If main editor is focused and code hint modal not showing and meta keys not pressed
                if(Editor.getFocusedEditor() && !CodeHintMgr.isOpen() && localcfg.keysToIgnore.indexOf(event.keyIdentifier) == -1) {
                    // We save the given file. If no file specified, assumes the current document.
                    CommandManager.execute(Commands.FILE_SAVE);
                }
            }, localcfg.time);
        }
    });

    /* MIX FUNCTIONS */
    function toggle(CommandObject, CheckStatusObjective) {
        var newCheckedStatusValue = (typeof CheckStatusObjective === 'undefined') ? isAutoSaveActivated : CheckStatusObjective;
        CommandObject.setChecked(newCheckedStatusValue);
        autoSavePrefs.set(checkedPrefs, newCheckedStatusValue);
        autoSavePrefs.save();
    }

    function msOrS(period) {
        var min = period / 1000 / 60;
        if(min >= 1) return min.toFixed(1) + " min";
        else if(period / 1000 >= 1) return period / 1000 + " s";
        else return period + " ms";
    }
});
