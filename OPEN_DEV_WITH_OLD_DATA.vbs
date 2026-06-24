Set shell = CreateObject("WScript.Shell")
root = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
cmd = """" & root & "\OPEN_DEV_WITH_OLD_DATA.cmd" & """"
shell.Run cmd, 0, False
