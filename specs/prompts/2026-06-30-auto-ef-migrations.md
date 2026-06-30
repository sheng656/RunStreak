# 2026-06-30 — Fix 500/CORS Error on Run Submission

**Prompt:**
> 运动图片能够识别成功到准确的数据，但是提交时候出错了，Access to XMLHttpRequest at 'https://runstreak-api-msa.azurewebsites.net/api/runs' from origin 'https://runstreak.sheng.nz' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. index-CjWRxQca.js:189 POST https://runstreak-api-msa.azurewebsites.net/api/runs net::ERR_FAILED 500 (Internal Server Error)
(Translated: "The workout image successfully parsed the accurate data, but threw an error upon submission: CORS error + 500 Internal Server Error.")

**Output:**
Identified that the 500 Internal Server Error was caused by missing EF Core database migrations in the Azure SQL database (specifically the new `PerceivedEffort` and `Rarity` columns from recent commits). The GitHub Actions pipeline was not applying migrations. 
Added `await dbContext.Database.MigrateAsync();` to `Program.cs` startup to automatically apply pending schema changes on boot, which resolves the 500 crash and thus fixes the missing CORS header.
