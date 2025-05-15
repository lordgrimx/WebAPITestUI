@echo off
echo Running ESLint on all components...

REM Navigate to the client directory if the script is run from the workspace root
REM If the script is already in the client directory, this cd command won't cause an issue.
cd /D "%~dp0"

REM Loop through all .jsx and .js files in the components directory and its subdirectories
FOR /R "components" %%F IN (*.jsx *.js) DO (
    echo Linting %%F
    npx eslint "%%F"
)

echo ESLint checks completed.
pause 