@echo off    
echo Export Start...  
for /f "delims=" %%i in ('dir /b /a-d /s "*.xls"','dir /b /a-d /s "*.xlsx"') do (  
echo %%i  
python excelToJson.py %%i 
)

echo Export Finish
pause 