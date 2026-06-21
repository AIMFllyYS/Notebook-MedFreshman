MinerU 提供两种文档解析 API，满足不同场景需求：

🎯 精准解析 API — 需填写token（API管理页面自定创建），支持单文件/批量、表格/公式/多格式输出
⚡ Agent 轻量解析 API — 免登录，IP 限频防滥用，专为 AI Agent 工作流设计
模式对比
对比维度	🎯 精准解析 API	⚡ Agent 轻量解析 API
是否需要 Token	✅ 需要	❌ 无需（IP 限频）
接口地址	/api/v4/extract/task 或 /api/v4/file-urls/batch	/api/v1/agent/parse/url 或 /api/v1/agent/parse/file
模型版本	pipeline（默认）/ vlm(推荐) / MinerU-HTML	固定 pipeline 轻量模型
文件大小限制	≤ 200MB	≤ 10MB
页数限制	≤ 200 页	≤ 20 页
批量支持	✅ 支持（≤ 200 个）	❌ 单文件
输出格式	Zip包，其中包含Markdown、JSON，且可导出为docx/html/latex	仅 Markdown（CDN 链接）
调用方式	异步（提交 → 轮询）	异步（提交 → 轮询）
🎯 精准解析 API
需填写token（API管理页面自定创建），支持 pipeline / vlm / MinerU-HTML 三种模型，单文件和批量均支持。

概述
MinerU 的精准解析 API 专为需要高精度、深层次结构化提取的复杂文档设计。它能够智能识别并处理各类复杂版式、多模态内容（如表格、数学公式、图表、图片、多栏布局等），将文档内容转化为高质量的结构化数据。

核心特性：

极致精度：提供行业领先的解析准确性，尤其擅长处理非标准和复杂文档
深度结构化：不仅仅是文本提取，更能深度理解文档的版面和语义，输出包含丰富层级关系的结构化数据
多模态支持：全面支持文本、表格、图片、公式等多种内容类型的精准识别与提取
复杂版式适应：有效应对扫描件、排版混乱、水印干扰等复杂文档场景
文件限制：

限制项	限制值
文件大小上限	200 MB
文件页数上限	200 页
支持文件类型	PDF、图片（png/jpg/jpeg/jp2/webp/gif/bmp）、Doc、Docx、Ppt、PPTx、Xls、Xlsx
1.单个文件解析
创建解析任务
接口说明

适用于通过 API 创建解析任务的场景，用户需在 Header 中填写 Token（可在 API 管理页面自定创建）。 注意：

单个文件大小不能超过 200MB,文件页数不超出 200 页
每个账号每天享有 1000 页最高优先级解析额度，超过 1000 页的部分优先级降低
因网络限制，github、aws 等国外 URL 会请求超时
该接口不支持文件直接上传
header头中需要包含 Authorization 字段，格式为 Bearer + 空格 + Token
Python 请求示例（适用于pdf、doc、ppt、excel、图片文件）：

import requests

token = "API管理页面自定创建的token"
url = "https://mineru.net/api/v4/extract/task"
header = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}
data = {
    "url": "https://cdn-mineru.openxlab.org.cn/demo/example.pdf",
    "model_version": "vlm"
}

res = requests.post(url,headers=header,json=data)
print(res.status_code)
print(res.json())
print(res.json()["data"])
Python 请求示例（适用于html文件）：

import requests

token = "API管理页面自定创建的token"
url = "https://mineru.net/api/v4/extract/task"
header = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}
data = {
    "url": "https://****",
    "model_version": "MinerU-HTML"
}

res = requests.post(url,headers=header,json=data)
print(res.status_code)
print(res.json())
print(res.json()["data"])
CURL 请求示例（适用于pdf、doc、ppt、excel、图片文件）：

curl --location --request POST 'https://mineru.net/api/v4/extract/task' \
--header 'Authorization: Bearer ***' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--data-raw '{
    "url": "https://cdn-mineru.openxlab.org.cn/demo/example.pdf",
    "model_version": "vlm"
}'
CURL 请求示例（适用于html文件）：

curl --location --request POST 'https://mineru.net/api/v4/extract/task' \
--header 'Authorization: Bearer ***' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--data-raw '{
    "url": "https://****",
    "model_version": "MinerU-HTML"
}'
请求体参数说明

参数	类型	是否必选	示例	描述
url	string	是	https://cdn-mineru.openxlab.org.cn/demo/example.pdf	文件 URL，支持.pdf、.doc、.docx、.ppt、.pptx、.xls、.xlsx、图片（png/jpg/jpeg/jp2/webp/gif/bmp）、.html多种格式
is_ocr	bool	否	false	是否启动 ocr 功能，默认 false，仅对pipeline、vlm模型有效
enable_formula	bool	否	true	是否开启公式识别，默认 true，仅对pipeline、vlm模型有效。特别注意的是：对于vlm模型，这个参数指只会影响行内公式的解析
enable_table	bool	否	true	是否开启表格识别，默认 true，仅对pipeline、vlm模型有效
language	string	否	ch	指定文档语言，默认 ch。可选值见 language 取值参考。仅对 pipeline、vlm 模型有效
data_id	string	否	abc**	解析对象对应的数据 ID。由大小写英文字母、数字、下划线（_）、短划线（-）、英文句号（.）组成，不超过 128 个字符，可以用于唯一标识您的业务数据。
callback	string	否	http://127.0.0.1/callback	解析结果回调通知您的 URL，支持使用 HTTP 和 HTTPS 协议的地址。该字段为空时，您必须定时轮询解析结果。callback 接口必须支持 POST 方法、UTF-8 编码、Content-Type:application/json 传输数据，以及参数 checksum 和 content。解析接口按照以下规则和格式设置 checksum 和 content，调用您的 callback 接口返回检测结果。
checksum：字符串格式，由用户 uid + seed + content 拼成字符串，通过 SHA256 算法生成。用户 UID，可在个人中心查询。为防篡改，您可以在获取到推送结果时，按上述算法生成字符串，与 checksum 做一次校验。
content：JSON 字符串格式，请自行解析反转成 JSON 对象。关于 content 结果的示例，请参见任务查询结果的返回示例，对应任务查询结果的 data 部分。
说明:您的服务端 callback 接口收到 Mineru 解析服务推送的结果后，如果返回的 HTTP 状态码为 200，则表示接收成功，其他的 HTTP 状态码均视为接收失败。接收失败时，mineru 将最多重复推送 5 次检测结果，直到接收成功。重复推送 5 次后仍未接收成功，则不再推送，建议您检查 callback 接口的状态。
seed	string	否	abc**	随机字符串，该值用于回调通知请求中的签名。由英文字母、数字、下划线（_）组成，不超过 64 个字符，由您自定义。用于在接收到内容安全的回调通知时校验请求由 Mineru 解析服务发起。
说明：当使用 callback 时，该字段必须提供。
extra_formats	[string]	否	["docx","html"]	markdown、json为默认导出格式，无须设置，该参数仅支持docx、html、latex三种格式中的一个或多个。对源文件为html的文件无效。
page_ranges	string	否	1-200	指定页码范围，格式为逗号分隔的字符串。例如："2,4-6"：表示选取第2页、第4页至第6页（包含4和6，结果为 [2,4,5,6]）；"2--2"：表示从第2页一直选取到倒数第二页（其中"-2"表示倒数第二页）。
model_version	string	否	vlm	mineru模型版本，三个选项:pipeline、vlm、MinerU-HTML，默认pipeline。如果解析的是HTML文件，model_version需明确指定为MinerU-HTML，如果是非HTML文件，可选择pipeline或vlm
no_cache	bool	否	false	是否绕过缓存，默认 false。我们的 API 服务器会将 URL 内容缓存一段时间，设置为 true 可忽略缓存结果，从 URL 获取最新内容。
cache_tolerance	int	否	900	缓存容忍时间（秒），默认 900（15分钟）。 可容忍的 URL 内容缓存有效时间，超出该时间的缓存不会被使用。当no_cache为false时有效
响应参数说明

参数	类型	示例	说明
code	int	0	接口状态码，成功：0
msg	string	ok	接口处理信息，成功："ok"
trace_id	string	c876cd60b202f2396de1f9e39a1b0172	请求 ID
data.task_id	string	a90e6ab6-44f3-4554-b459-b62fe4c6b436	提取任务 id，可用于查询任务结果
响应示例

{
  "code": 0,
  "data": {
    "task_id": "a90e6ab6-44f3-4554-b4***"
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
获取任务结果
接口说明

通过 task_id 查询提取任务目前的进度，任务处理完成后，接口会响应对应的提取详情。

Python 请求示例

import requests

token = "API管理页面自定创建的token"
task_id = "上一步创建任务返回的 task_id"
url = f"https://mineru.net/api/v4/extract/task/{task_id}"
header = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

res = requests.get(url, headers=header)
print(res.status_code)
print(res.json())
print(res.json()["data"])
CURL 请求示例

curl --location --request GET 'https://mineru.net/api/v4/extract/task/{task_id}' \
--header 'Authorization: Bearer *****' \
--header 'Accept: */*'
响应参数说明

参数	类型	示例	说明
code	int	0	接口状态码，成功：0
msg	string	ok	接口处理信息，成功："ok"
trace_id	string	c876cd60b202f2396de1f9e39a1b0172	请求 ID
data.task_id	string	abc**	任务 ID
data.data_id	string	abc**	解析对象对应的数据 ID。
说明：如果在解析请求参数中传入了 data_id，则此处返回对应的 data_id。
data.state	string	done	任务处理状态，完成:done，pending: 排队中，running: 正在解析，failed：解析失败，converting：格式转换中
data.full_zip_url	string	https://cdn-mineru.openxlab.org.cn/pdf/018e53ad-d4f1-475d-b380-36bf24db9914.zip	文件解析结果压缩包。非html文件解析结果详细说明请参考：https://opendatalab.github.io/MinerU/reference/output_files/ ，其中layout.json对应中间处理结果 (middle.json), **_model.json对应模型推理结果 (model.json)，**_content_list.json对应内容列表 (content_list.json)，full.md为MarkDown解析结果。html文件解析结果略有不同：full.md为MarkDown解析结果,main.html为提取后正文html
data.err_msg	string	文件格式不支持，请上传符合要求的文件类型	解析失败原因，当 state=failed 时有效
data.extract_progress.extracted_pages	int	1	文档已解析页数，当state=running时有效
data.extract_progress.start_time	string	2025-01-20 11:43:20	文档解析开始时间，当state=running时有效
data.extract_progress.total_pages	int	2	文档总页数，当state=running时有效
响应示例

{
  "code": 0,
  "data": {
    "task_id": "47726b6e-46ca-4bb9-******",
    "state": "running",
    "err_msg": "",
    "extract_progress": {
      "extracted_pages": 1,
      "total_pages": 2,
      "start_time": "2025-01-20 11:43:20"
    }
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
{
  "code": 0,
  "data": {
    "task_id": "47726b6e-46ca-4bb9-******",
    "state": "done",
    "full_zip_url": "https://cdn-mineru.openxlab.org.cn/pdf/018e53ad-d4f1-475d-b380-36bf24db9914.zip",
    "err_msg": ""
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
2.批量文件解析
本地文件批量上传解析
接口说明

适用于本地文件上传解析的场景，可通过此接口批量申请文件上传链接，上传文件后，系统会自动提交解析任务 注意：

申请的文件上传链接有效期为 24 小时，请在有效期内完成文件上传
上传文件时，无须设置 Content-Type 请求头
文件上传完成后，无须调用提交解析任务接口。系统会自动扫描已上传完成文件自动提交解析任务
单次申请链接不能超过 50 个
header头中需要包含 Authorization 字段，格式为 Bearer + 空格 + Token
Python 请求示例（适用于pdf、doc、ppt、excel、图片文件）：

import requests

token = "API管理页面自定创建的token"
url = "https://mineru.net/api/v4/file-urls/batch"
header = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}
data = {
    "files": [
        {"name":"demo.pdf", "data_id": "abcd"}
    ],
    "model_version":"vlm"
}
file_path = ["demo.pdf"]
try:
    response = requests.post(url,headers=header,json=data)
    if response.status_code == 200:
        result = response.json()
        print('response success. result:{}'.format(result))
        if result["code"] == 0:
            batch_id = result["data"]["batch_id"]
            urls = result["data"]["file_urls"]
            print('batch_id:{},urls:{}'.format(batch_id, urls))
            for i in range(0, len(urls)):
                with open(file_path[i], 'rb') as f:
                    res_upload = requests.put(urls[i], data=f)
                    if res_upload.status_code == 200:
                        print(f"{urls[i]} upload success")
                    else:
                        print(f"{urls[i]} upload failed")
        else:
            print('apply upload url failed,reason:{}'.format(result["msg"]))
    else:
        print('response not success. status:{} ,result:{}'.format(response.status_code, response))
except Exception as err:
    print(err)
Python 请求示例（适用于html文件）：

import requests

token = "API管理页面自定创建的token"
url = "https://mineru.net/api/v4/file-urls/batch"
header = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}
data = {
    "files": [
        {"name":"demo.html", "data_id": "abcd"}
    ],
    "model_version":"MinerU-HTML"
}
file_path = ["demo.html"]
try:
    response = requests.post(url,headers=header,json=data)
    if response.status_code == 200:
        result = response.json()
        print('response success. result:{}'.format(result))
        if result["code"] == 0:
            batch_id = result["data"]["batch_id"]
            urls = result["data"]["file_urls"]
            print('batch_id:{},urls:{}'.format(batch_id, urls))
            for i in range(0, len(urls)):
                with open(file_path[i], 'rb') as f:
                    res_upload = requests.put(urls[i], data=f)
                    if res_upload.status_code == 200:
                        print(f"{urls[i]} upload success")
                    else:
                        print(f"{urls[i]} upload failed")
        else:
            print('apply upload url failed,reason:{}'.format(result["msg"]))
    else:
        print('response not success. status:{} ,result:{}'.format(response.status_code, response))
except Exception as err:
    print(err)
CURL 请求示例（适用于pdf、doc、ppt、excel、图片文件）：

curl --location --request POST 'https://mineru.net/api/v4/file-urls/batch' \
--header 'Authorization: Bearer ***' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--data-raw '{
    "files": [
        {"name":"demo.pdf", "data_id": "abcd"}
    ],
    "model_version": "vlm"
}'
CURL 请求示例（适用于html文件）：

curl --location --request POST 'https://mineru.net/api/v4/file-urls/batch' \
--header 'Authorization: Bearer ***' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--data-raw '{
    "files": [
        {"name":"demo.html", "data_id": "abcd"}
    ],
    "model_version": "MinerU-HTML"
}'
CURL 文件上传示例：

curl -X PUT -T /path/to/your/file.pdf 'https://****'
请求体参数说明

参数	类型	是否必选	示例	描述
enable_formula	bool	否	true	是否开启公式识别，默认 true，仅对pipeline、vlm模型有效。特别注意的是：对于vlm模型，这个参数指只会影响行内公式的解析
enable_table	bool	否	true	是否开启表格识别，默认 true，仅对pipeline、vlm模型有效
language	string	否	ch	指定文档语言，默认 ch。可选值见 language 取值参考。仅对 pipeline、vlm 模型有效
file.‌name	string	是	demo.pdf	文件名，支持.pdf、.doc、.docx、.ppt、.pptx、.xls、.xlsx、图片（png/jpg/jpeg/jp2/webp/gif/bmp）、.html多种格式，我们强烈建议文件名带上正确的后缀名
file.is_ocr	bool	否	true	是否启动 ocr 功能，默认 false，仅对pipeline、vlm模型有效
file.data_id	string	否	abc**	解析对象对应的数据 ID。由大小写英文字母、数字、下划线（_）、短划线（-）、英文句号（.）组成，不超过 128 个字符，可以用于唯一标识您的业务数据。
file.page_ranges	string	否	1-200	指定页码范围，格式为逗号分隔的字符串。例如："2,4-6"：表示选取第2页、第4页至第6页（包含4和6，结果为 [2,4,5,6]）；"2--2"：表示从第2页一直选取到倒数第二页（其中"-2"表示倒数第二页）。
callback	string	否	http://127.0.0.1/callback	解析结果回调通知您的 URL，支持使用 HTTP 和 HTTPS 协议的地址。该字段为空时，您必须定时轮询解析结果。callback 接口必须支持 POST 方法、UTF-8 编码、Content-Type:application/json 传输数据，以及参数 checksum 和 content。解析接口按照以下规则和格式设置 checksum 和 content，调用您的 callback 接口返回检测结果。
checksum：字符串格式，由用户 uid + seed + content 拼成字符串，通过 SHA256 算法生成。用户 UID，可在个人中心查询。为防篡改，您可以在获取到推送结果时，按上述算法生成字符串，与 checksum 做一次校验。
content：JSON 字符串格式，请自行解析反转成 JSON 对象。关于 content 结果的示例，请参见任务查询结果的返回示例，对应任务查询结果的 data 部分。
说明:您的服务端 callback 接口收到 Mineru 解析服务推送的结果后，如果返回的 HTTP 状态码为 200，则表示接收成功，其他的 HTTP 状态码均视为接收失败。接收失败时，mineru 将最多重复推送 5 次检测结果，直到接收成功。重复推送 5 次后仍未接收成功，则不再推送，建议您检查 callback 接口的状态。
seed	string	否	abc**	随机字符串，该值用于回调通知请求中的签名。由英文字母、数字、下划线（_）组成，不超过 64 个字符。由您自定义，用于在接收到内容安全的回调通知时校验请求由 Mineru 解析服务发起。
说明:当使用 callback 时，该字段必须提供。
extra_formats	[string]	否	["docx","html"]	markdown、json为默认导出格式，无须设置，该参数仅支持docx、html、latex三种格式中的一个或多个。对源文件为html的文件无效。
model_version	string	否	vlm	mineru模型版本，三个选项:pipeline、vlm、MinerU-HTML，默认pipeline。如果解析的是HTML文件，model_version需明确指定为MinerU-HTML，如果是非HTML文件，可选择pipeline或vlm
响应参数说明

参数	类型	示例	说明
code	int	0	接口状态码，成功： 0
msg	string	ok	接口处理信息，成功："ok"
trace_id	string	c876cd60b202f2396de1f9e39a1b0172	请求 ID
data.batch_id	string	2bb2f0ec-a336-4a0a-b61a-****	批量提取任务 id，可用于批量查询解析结果
data.file_urls	[string]	["https://mineru.oss-cn-shanghai.aliyuncs.com/api-upload/***"]	文件上传链接
响应示例

{
  "code": 0,
  "data": {
    "batch_id": "2bb2f0ec-a336-4a0a-b61a-241afaf9cc87",
    "file_urls": ["https://***"]
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
url 批量上传解析
接口说明

适用于通过 API 批量创建提取任务的场景 注意：

单次申请链接不能超过 50 个
文件大小不能超过 200MB,文件页数不超出 200 页
因网络限制，github、aws 等国外 URL 会请求超时
header头中需要包含 Authorization 字段，格式为 Bearer + 空格 + Token
Python 请求示例（适用于pdf、doc、ppt、excel、图片文件）：

import requests

token = "API管理页面自定创建的token"
url = "https://mineru.net/api/v4/extract/task/batch"
header = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}
data = {
    "files": [
        {"url":"https://cdn-mineru.openxlab.org.cn/demo/example.pdf", "data_id": "abcd"}
    ],
    "model_version": "vlm"
}
try:
    response = requests.post(url,headers=header,json=data)
    if response.status_code == 200:
        result = response.json()
        print('response success. result:{}'.format(result))
        if result["code"] == 0:
            batch_id = result["data"]["batch_id"]
            print('batch_id:{}'.format(batch_id))
        else:
            print('submit task failed,reason:{}'.format(result["msg"]))
    else:
        print('response not success. status:{} ,result:{}'.format(response.status_code, response))
except Exception as err:
    print(err)
Python 请求示例（适用于html文件）：

import requests

token = "API管理页面自定创建的token"
url = "https://mineru.net/api/v4/extract/task/batch"
header = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}
data = {
    "files": [
        {"url":"https://***", "data_id": "abcd"}
    ],
    "model_version": "MinerU-HTML"
}
try:
    response = requests.post(url,headers=header,json=data)
    if response.status_code == 200:
        result = response.json()
        print('response success. result:{}'.format(result))
        if result["code"] == 0:
            batch_id = result["data"]["batch_id"]
            print('batch_id:{}'.format(batch_id))
        else:
            print('submit task failed,reason:{}'.format(result["msg"]))
    else:
        print('response not success. status:{} ,result:{}'.format(response.status_code, response))
except Exception as err:
    print(err)
CURL 请求示例（适用于pdf、doc、ppt、excel、图片文件）：

curl --location --request POST 'https://mineru.net/api/v4/extract/task/batch' \
--header 'Authorization: Bearer ***' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--data-raw '{
    "files": [
        {"url":"https://cdn-mineru.openxlab.org.cn/demo/example.pdf", "data_id": "abcd"}
    ],
    "model_version": "vlm"
}'
CURL 请求示例（适用于html文件）：

curl --location --request POST 'https://mineru.net/api/v4/extract/task/batch' \
--header 'Authorization: Bearer ***' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--data-raw '{
    "files": [
        {"url":"https://***", "data_id": "abcd"}
    ],
    "model_version": "MinerU-HTML"
}'
请求体参数说明

参数	类型	是否必选	示例	描述
enable_formula	bool	否	true	是否开启公式识别，默认 true，仅对pipeline、vlm模型有效。特别注意的是：对于vlm模型，这个参数指只会影响行内公式的解析
enable_table	bool	否	true	是否开启表格识别，默认 true，仅对pipeline、vlm模型有效
language	string	否	ch	指定文档语言，默认 ch。可选值见 language 取值参考。仅对 pipeline、vlm 模型有效
file.url	string	是	demo.pdf	文件链接，支持.pdf、.doc、.docx、.ppt、.pptx、.xls、.xlsx、图片（png/jpg/jpeg/jp2/webp/gif/bmp、.html多种格式
file.is_ocr	bool	否	true	是否启动 ocr 功能，默认 false，仅对pipeline、vlm模型有效
file.data_id	string	否	abc**	解析对象对应的数据 ID。由大小写英文字母、数字、下划线（_）、短划线（-）、英文句号（.）组成，不超过 128 个字符，可以用于唯一标识您的业务数据。
file.page_ranges	string	否	1-200	指定页码范围，格式为逗号分隔的字符串。例如："2,4-6"：表示选取第2页、第4页至第6页（包含4和6，结果为 [2,4,5,6]）；"2--2"：表示从第2页一直选取到倒数第二页（其中"-2"表示倒数第二页）。
callback	string	否	http://127.0.0.1/callback	解析结果回调通知您的 URL，支持使用 HTTP 和 HTTPS 协议的地址。该字段为空时，您必须定时轮询解析结果。callback 接口必须支持 POST 方法、UTF-8 编码、Content-Type:application/json 传输数据，以及参数 checksum 和 content。解析接口按照以下规则和格式设置 checksum 和 content，调用您的 callback 接口返回检测结果。
checksum：字符串格式，由用户 uid + seed + content 拼成字符串，通过 SHA256 算法生成。用户 UID，可在个人中心查询。为防篡改，您可以在获取到推送结果时，按上述算法生成字符串，与 checksum 做一次校验。
content：JSON 字符串格式，请自行解析反转成 JSON 对象。关于 content 结果的示例，请参见任务查询结果的返回示例，对应任务查询结果的 data 部分。
说明:您的服务端 callback 接口收到 Mineru 解析服务推送的结果后，如果返回的 HTTP 状态码为 200，则表示接收成功，其他的 HTTP 状态码均视为接收失败。接收失败时，mineru 将最多重复推送 5 次检测结果，直到接收成功。重复推送 5 次后仍未接收成功，则不再推送，建议您检查 callback 接口的状态。
seed	string	否	abc**	随机字符串，该值用于回调通知请求中的签名。由英文字母、数字、下划线（_）组成，不超过 64 个字符。由您自定义，用于在接收到内容安全的回调通知时校验请求由 Mineru 解析服务发起。
说明：当使用 callback 时，该字段必须提供。
extra_formats	[string]	否	["docx","html"]	markdown、json为默认导出格式，无须设置，该参数仅支持docx、html、latex三种格式中的一个或多个。对源文件为html的文件无效。
model_version	string	否	vlm	mineru模型版本，三个选项:pipeline、vlm、MinerU-HTML，默认pipeline。如果解析的是HTML文件，model_version需明确指定为MinerU-HTML，如果是非HTML文件，可选择pipeline或vlm
no_cache	bool	否	false	是否绕过缓存，默认 false。我们的 API 服务器会将 URL 内容缓存一段时间，设置为 true 可忽略缓存结果，从 URL 获取最新内容。
cache_tolerance	int	否	900	缓存容忍时间（秒），默认 900（15分钟）。 可容忍的 URL 内容缓存有效时间，超出该时间的缓存不会被使用。当no_cache为false时有效
请求体示例

{
  "files": [
    {
      "url": "https://cdn-mineru.openxlab.org.cn/demo/example.pdf",
      "data_id": "abcd"
    }
  ],
  "model_version": "vlm"
}
响应参数说明

参数	类型	示例	说明
code	int	0	接口状态码，成功：0
msg	string	ok	接口处理信息，成功："ok"
trace_id	string	c876cd60b202f2396de1f9e39a1b0172	请求 ID
data.batch_id	string	2bb2f0ec-a336-4a0a-b61a-****	批量提取任务 id，可用于批量查询解析结果
响应示例

{
  "code": 0,
  "data": {
    "batch_id": "2bb2f0ec-a336-4a0a-b61a-241afaf9cc87"
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
批量获取任务结果
接口说明

通过 batch_id 批量查询提取任务的进度。

Python 请求示例

import requests

token = "API管理页面自定创建的token"
batch_id = "上一步批量提交返回的 batch_id"
url = f"https://mineru.net/api/v4/extract-results/batch/{batch_id}"
header = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

res = requests.get(url, headers=header)
print(res.status_code)
print(res.json())
print(res.json()["data"])
CURL 请求示例

curl --location --request GET 'https://mineru.net/api/v4/extract-results/batch/{batch_id}' \
--header 'Authorization: Bearer *****' \
--header 'Accept: */*'
响应参数说明

参数	类型	示例	说明
code	int	0	接口状态码，成功：0
msg	string	ok	接口处理信息，成功："ok"
trace_id	string	c876cd60b202f2396de1f9e39a1b0172	请求 ID
data.batch_id	string	2bb2f0ec-a336-4a0a-b61a-241afaf9cc87	batch_id
data.extract_result.file_name	string	demo.pdf	文件名
data.extract_result.state	string	done	任务处理状态，完成:done，waiting-file: 等待文件上传排队提交解析任务中，pending: 排队中，running: 正在解析，failed：解析失败，converting：格式转换中
data.extract_result.full_zip_url	string	https://cdn-mineru.openxlab.org.cn/pdf/018e53ad-d4f1-475d-b380-36bf24db9914.zip	文件解析结果压缩包。非html文件解析结果详细说明请参考：https://opendatalab.github.io/MinerU/reference/output_files/ ，其中layout.json对应中间处理结果 (middle.json), **_model.json对应模型推理结果 (model.json)，**_content_list.json对应内容列表 (content_list.json)，full.md为MarkDown解析结果。html文件解析结果略有不同：full.md为MarkDown解析结果,main.html为提取后正文html
data.extract_result.err_msg	string	文件格式不支持，请上传符合要求的文件类型	解析失败原因，当 state=failed 时，有效
data.extract_result.data_id	string	abc**	解析对象对应的数据 ID。
说明：如果在解析请求参数中传入了 data_id，则此处返回对应的 data_id。
data.extract_result.extract_progress.extracted_pages	int	1	文档已解析页数，当state=running时有效
data.extract_result.extract_progress.start_time	string	2025-01-20 11:43:20	文档解析开始时间，当state=running时有效
data.extract_result.extract_progress.total_pages	int	2	文档总页数，当state=running时有效
响应示例

{
  "code": 0,
  "data": {
    "batch_id": "2bb2f0ec-a336-4a0a-b61a-241afaf9cc87",
    "extract_result": [
      {
        "file_name": "example.pdf",
        "state": "done",
        "err_msg": "",
        "full_zip_url": "https://cdn-mineru.openxlab.org.cn/pdf/018e53ad-d4f1-475d-b380-36bf24db9914.zip"
      },
      {
        "file_name": "demo.pdf",
        "state": "running",
        "err_msg": "",
        "extract_progress": {
          "extracted_pages": 1,
          "total_pages": 2,
          "start_time": "2025-01-20 11:43:20"
        }
      }
    ]
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
常见错误码
错误码	说明	解决建议
A0202	Token 错误	检查 Token 是否正确，请检查是否有Bearer前缀 或者更换新 Token
A0211	Token 过期	更换新 Token
-500	传参错误	请确保参数类型及Content-Type正确
-10001	服务异常	请稍后再试
-10002	请求参数错误	检查请求参数格式
-60001	生成上传 URL 失败，请稍后再试	请稍后再试
-60002	获取匹配的文件格式失败	检测文件类型失败，请求的文件名及链接中带有正确的后缀名，且文件为 pdf,doc,docx,ppt,pptx,xls,xlsx,png,jp(e)g 中的一种
-60003	文件读取失败	请检查文件是否损坏并重新上传
-60004	空文件	请上传有效文件
-60005	文件大小超出限制	检查文件大小，最大支持 200MB
-60006	文件页数超过限制	请拆分文件后重试
-60007	模型服务暂时不可用	请稍后重试或联系技术支持
-60008	文件读取超时	检查 URL 可访问
-60009	任务提交队列已满	请稍后再试
-60010	解析失败	请稍后再试
-60011	获取有效文件失败	请确保文件已上传
-60012	找不到任务	请确保task_id有效且未删除
-60013	没有权限访问该任务	只能访问自己提交的任务
-60014	删除运行中的任务	运行中的任务暂不支持删除
-60015	文件转换失败	可以手动转为pdf再上传
-60016	文件转换失败	文件转换为指定格式失败，可以尝试其他格式导出或重试
-60017	重试次数达到上限	等后续模型升级后重试
-60018	每日解析任务数量已达上限	明日再来
-60019	html文件解析额度不足	明日再来
-60020	文件拆分失败	请稍后重试
-60021	读取文件页数失败	请稍后重试
-60022	网页读取失败	可能因网络问题或者限频导致读取失败，请稍后重试
⚡ Agent 轻量解析 API
免登录，无需 Token，IP 限频防滥用。专为 OpenClaw 等 AI Agent 场景设计，仅输出 Markdown，免登录零门槛。

概述
Agent 轻量解析接口专为 OpenClaw 等 AI Agent 场景设计，提供快速、免登录的文档解析能力。

核心特性：

无需登录：通过 IP 限频防滥用，无需 Token
轻量快速：PDF、图片使用 pipeline 轻量模型，禁用表格/公式识别，追求最快解析速度; Word、PPT使用Office原生API解析
统一输出：仅输出 Markdown 格式，返回 CDN 链接
双模式提交：URL 解析和文件上传为独立接口，文件上传采用签名上传模式
文件限制：

限制项	限制值
文件大小上限	10 MB
文件页数上限	20 页
支持文件类型	PDF、图片（png/jpg/jpeg/jp2/webp/gif/bmp）、Docx、PPTx、Xlsx
IP 限频：

每 IP 每分钟提交请求数有限制
超出限制将返回 HTTP 429 状态码
1. URL 解析接口
接口说明

提交一个远程文件 URL 进行解析。后端自动下载并解析文件。

接口为异步返回模式，提交成功后返回 task_id，需通过查询接口轮询结果。

请求地址

POST https://mineru.net/api/v1/agent/parse/url
请求体参数说明（JSON）

参数	类型	是否必选	说明
url	string	必填	远程文件 URL，支持 PDF、图片、Doc/Docx、PPT/PPTx、Xlsx 格式。不支持 HTML。
file_name	string	可选	文件名（含扩展名），用于判断文件类型。若不提供则从 URL 自动解析。
language	string	可选	解析语言，影响 OCR 识别效果。默认 ch。可选值见 language 取值参考。仅对 PDF 文件生效
enable_table	bool	可选	是否开启表格识别。默认 true。仅对 PDF 文件生效
is_ocr	bool	可选	是否开启 OCR。默认 false。仅对 PDF 文件生效
enable_formula	bool	可选	是否开启公式识别。默认 true。仅对 PDF 文件生效
page_range	string	可选	页码范围，仅对 PDF 有效。支持 from-to（如 1-10）或单个页码（如 5），不支持逗号分隔的复杂格式。
注意：

无需 Authorization 请求头
请求体为 JSON 格式（Content-Type: application/json），不支持 multipart/form-data
Python 请求示例

import requests

url = "https://mineru.net/api/v1/agent/parse/url"

data = {
    "url": "https://cdn-mineru.openxlab.org.cn/demo/example.pdf",
    "language": "ch",
    "page_range": "1-10",
    "enable_table": True,
    "is_ocr": False,
    "enable_formula": True
}

res = requests.post(url, json=data)
print(res.json())
CURL 请求示例

curl --location --request POST 'https://mineru.net/api/v1/agent/parse/url' \
--header 'Content-Type: application/json' \
--data-raw '{
    "url": "https://cdn-mineru.openxlab.org.cn/demo/example.pdf",
    "language": "ch",
    "page_range": "1-10",
    "enable_table": true,
    "is_ocr": false,
    "enable_formula": true
}'
响应参数说明

参数	类型	示例	说明
code	int	0	接口状态码，成功：0
msg	string	ok	接口处理信息，成功："ok"
trace_id	string	c876cd60b202f2396de1f9e39a1b0172	请求 ID
data.task_id	string	a90e6ab6-44f3-4554-b459-b62fe4c6b43605	解析任务 ID，用于查询任务结果。
响应示例

{
  "code": 0,
  "data": {
    "task_id": "a90e6ab6-44f3-4554-b459-b62fe4c6b43605"
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
2. 本地文件上传接口（签名上传）
接口说明

提交一个文件上传解析任务。接口采用签名上传模式：

调用本接口，传入文件名等参数，获取 task_id、OSS 签名上传 URL（file_url）
客户端使用 PUT 方法将文件直接上传到 file_url
上传完成后，后端自动检测并开始解析
通过查询接口轮询解析结果
请求地址

POST https://mineru.net/api/v1/agent/parse/file
请求体参数说明（JSON）

参数	类型	是否必选	说明
file_name	string	必填	文件名（含扩展名），用于判断文件类型。
language	string	可选	解析语言，影响 OCR 识别效果。默认 ch。可选值见 language 取值参考。仅对 PDF 文件生效
enable_table	bool	可选	是否开启表格识别。默认 true。仅对 PDF 文件生效
is_ocr	bool	可选	是否开启 OCR。默认 false。仅对 PDF 文件生效
enable_formula	bool	可选	是否开启公式识别。默认 true。仅对 PDF 文件生效
page_range	string	可选	页码范围，仅对 PDF 有效。支持 from-to（如 1-10）或单个页码（如 5），不支持逗号分隔的复杂格式。
注意：

无需 Authorization 请求头
请求体为 JSON 格式（application/json）
不支持批量上传，每次请求只能上传一个文件
响应参数说明

参数	类型	示例	说明
code	int	0	接口状态码，成功：0
msg	string	ok	接口处理信息，成功："ok"
trace_id	string	c876cd60b202f2396de1f9e39a1b0172	请求 ID
data.task_id	string	a90e6ab6-44f3-4554-b459-b62fe4c6b43605	解析任务 ID，用于查询任务结果。
data.file_url	string	https://oss-mineru.../agent/a90e6ab6-...pdf	OSS 签名上传 URL，客户端 PUT 上传文件到此地址
响应示例

{
  "code": 0,
  "data": {
    "task_id": "a90e6ab6-44f3-4554-b459-b62fe4c6b43605",
    "file_url": "https://oss-mineru.openxlab.org.cn/agent/a90e6ab6-...pdf?Expires=..."
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
Python 请求示例（完整签名上传流程）

import requests

# 第一步：获取签名上传 URL
api_url = "https://mineru.net/api/v1/agent/parse/file"
data = {
    "file_name": "document.pdf",
    "language": "ch",
    "page_range": "1-10",
    "enable_table": True,
    "is_ocr": False,
    "enable_formula": True
}

res = requests.post(api_url, json=data)
result = res.json()
task_id = result["data"]["task_id"]
file_url = result["data"]["file_url"]

print(f"任务已创建, task_id: {task_id}")

# 第二步：PUT 上传文件到 OSS
with open("document.pdf", "rb") as f:
    put_res = requests.put(file_url, data=f)
    print(f"文件上传状态: {put_res.status_code}")
CURL 请求示例

# 第一步：获取签名上传 URL
curl --location --request POST 'https://mineru.net/api/v1/agent/parse/file' \
--header 'Content-Type: application/json' \
--data-raw '{
    "file_name": "document.pdf",
    "language": "ch",
    "page_range": "1-10",
    "enable_table": true,
    "is_ocr": false,
    "enable_formula": true
}'

# 第二步：PUT 上传文件到返回的 file_url
curl --location --request PUT '<file_url>' \
--data-binary '@document.pdf'
3. 查询解析结果
接口说明

通过 task_id 查询解析任务的状态和结果。任务处理完成后，响应中包含 Markdown 结果文件的 CDN 下载链接。

请求地址

GET https://mineru.net/api/v1/agent/parse/{task_id}
Python 请求示例

import requests

task_id = "a90e6ab6-44f3-4554-b459-b62fe4c6b43605"
url = f"https://mineru.net/api/v1/agent/parse/{task_id}"

res = requests.get(url)
print(res.json())
CURL 请求示例

curl --location --request GET 'https://mineru.net/api/v1/agent/parse/{task_id}'
响应参数说明

参数	类型	示例	说明
code	int	0	接口状态码，成功：0
msg	string	ok	接口处理信息，成功："ok"
trace_id	string	c876cd60b202f2396de1f9e39a1b0172	请求 ID
data.task_id	string	a90e6ab6-...05	任务 ID（与提交时返回的一致）
data.state	string	done	任务状态：waiting-file（等待文件上传，仅文件上传模式）、uploading(文件下载中)、pending（排队中）、running（解析中）、done（完成）、failed（失败）
data.markdown_url	string	https://cdn-mineru.../full.md	Markdown 结果文件的 CDN 下载链接，当 state=done 时有效
data.err_msg	string	file page count exceeds lightweight API limit	错误信息，当 state=failed 时有效
data.err_code	int	-30003	错误码，当 state=failed 时有效。详见底部错误码表
响应示例（等待文件上传 — 仅文件上传模式）

{
  "code": 0,
  "data": {
    "task_id": "a90e6ab6-44f3-4554-b459-b62fe4c6b43605",
    "state": "waiting-file"
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
响应示例（处理中）

{
  "code": 0,
  "data": {
    "task_id": "a90e6ab6-44f3-4554-b459-b62fe4c6b43605",
    "state": "running"
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
响应示例（完成）

{
  "code": 0,
  "data": {
    "task_id": "a90e6ab6-44f3-4554-b459-b62fe4c6b43605",
    "state": "done",
    "markdown_url": "https://cdn-mineru.openxlab.org.cn/pdf/a90e6ab6-.../full.md"
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
响应示例（失败）

{
  "code": 0,
  "data": {
    "task_id": "a90e6ab6-44f3-4554-b459-b62fe4c6b43605",
    "state": "failed",
    "err_code": -30003,
    "err_msg": "file page count exceeds lightweight API limit (50 pages), please use the standard API"
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
完整使用示例（Python）
URL 模式

def parse_by_url(url, language="ch", page_range=None, enable_table=True, is_ocr=False, enable_formula=True):
    """通过 URL 提交文档解析任务并等待结果。"""
    # 1. 提交 URL 解析任务
    data = {"url": url, "language": language, "enable_table": enable_table, "is_ocr": is_ocr, "enable_formula": enable_formula}
    if page_range:
        data["page_range"] = page_range

    resp = requests.post(f"{BASE_URL}/parse/url", json=data)
    result = resp.json()
    if result["code"] != 0:
        print(f"提交失败: {result['msg']}")
        return None

    task_id = result["data"]["task_id"]
    print(f"任务已提交, task_id: {task_id}")

    # 2. 轮询等待结果
    return poll_result(task_id)


def poll_result(task_id, timeout=300, interval=3):
    """轮询查询解析结果。"""
    state_labels = {
        "uploading": "文件下载中",
        "pending": "排队中",
        "running": "解析中",
        "waiting-file": "等待文件上传",
    }
    start = time.time()
    while time.time() - start < timeout:
        resp = requests.get(f"{BASE_URL}/parse/{task_id}")
        result = resp.json()
        state = result["data"]["state"]
        elapsed = int(time.time() - start)

        if state == "done":
            markdown_url = result["data"]["markdown_url"]
            print(f"[{elapsed}s] 解析完成, Markdown 下载链接: {markdown_url}")
            md_resp = requests.get(markdown_url)
            return md_resp.text

        if state == "failed":
            print(f"[{elapsed}s] 解析失败: {result['data'].get('err_msg', '未知错误')}")
            return None

        print(f"[{elapsed}s] {state_labels.get(state, state)}...")
        time.sleep(interval)

    print(f"轮询超时 ({timeout}s)，请稍后手动查询 task_id: {task_id}")
    return None


# 使用示例
content = parse_by_url("https://cdn-mineru.openxlab.org.cn/demo/example.pdf")
文件上传模式（签名上传）

import requests
import time

BASE_URL = "https://mineru.net/api/v1/agent"

def parse_by_file(file_path, language="ch", page_range=None, enable_table=True, is_ocr=False, enable_formula=True):
    """通过文件上传提交文档解析任务并等待结果。"""
    file_name = file_path.split("/")[-1].split("\\")[-1]

    # 1. 获取签名上传 URL
    data = {"file_name": file_name, "language": language, "enable_table": enable_table, "is_ocr": is_ocr, "enable_formula": enable_formula}
    if page_range:
        data["page_range"] = page_range

    resp = requests.post(f"{BASE_URL}/parse/file", json=data)
    result = resp.json()
    if result["code"] != 0:
        print(f"获取上传链接失败: {result['msg']}")
        return None

    task_id = result["data"]["task_id"]
    file_url = result["data"]["file_url"]
    print(f"任务已创建, task_id: {task_id}")

    # 2. PUT 上传文件到 OSS
    with open(file_path, "rb") as f:
        put_resp = requests.put(file_url, data=f)
        if put_resp.status_code not in (200, 201):
            print(f"文件上传失败, HTTP {put_resp.status_code}")
            return None
    print("文件上传成功，等待解析...")

    # 3. 轮询等待结果
    return poll_result(task_id)


def poll_result(task_id, timeout=300, interval=3):
    """轮询查询解析结果。"""
    state_labels = {
        "pending": "排队中",
        "running": "解析中",
        "waiting-file": "等待文件上传",
    }
    start = time.time()
    while time.time() - start < timeout:
        resp = requests.get(f"{BASE_URL}/parse/{task_id}")
        result = resp.json()
        state = result["data"]["state"]
        elapsed = int(time.time() - start)

        if state == "done":
            markdown_url = result["data"]["markdown_url"]
            print(f"[{elapsed}s] 解析完成, Markdown 下载链接: {markdown_url}")
            md_resp = requests.get(markdown_url)
            return md_resp.text

        if state == "failed":
            print(f"[{elapsed}s] 解析失败: {result['data'].get('err_msg', '未知错误')}")
            return None

        print(f"[{elapsed}s] {state_labels.get(state, state)}...")
        time.sleep(interval)

    print(f"轮询超时 ({timeout}s)，请稍后手动查询 task_id: {task_id}")
    return None


# 使用示例
content = parse_by_file("./document.pdf")
Agent 专属错误码
错误码	说明	Agent 应对策略
-30001	文件大小超出轻量接口限制（10MB）	请使用标准 API 或拆分文件
-30002	轻量接口不支持该文件类型	请上传 PDF/图片/Doc/PPT/Excel
-30003	文件页数超出轻量接口限制	请使用标准 API 或指定 page_range
-30004	请求参数错误	检查必填参数是否缺失
language 取值参考
language 字段建议按下表传入。默认值为 ch。

Standalone language packs
Value	Included languages	说明
ch	Chinese, English, Chinese Traditional	中英文（默认值）
ch_server	Chinese, English, Chinese Traditional, Japanese	繁体、手写体
en	English	纯英文
japan	Chinese, English, Chinese Traditional, Japanese	日文为主
korean	Korean, English	韩文
chinese_cht	Chinese, English, Chinese Traditional, Japanese	繁体中文为主
ta	Tamil, English	泰米尔文
te	Telugu, English	泰卢固文
ka	Kannada	卡纳达文
el	Greek, English	希腊文
th	Thai, English	泰文
Language family packs
Value	Script/Family	Included languages
latin	Latin script (拉丁语系)	French, German, Afrikaans, Italian, Spanish, Bosnian, Portuguese, Czech, Welsh, Danish, Estonian, Irish, Croatian, Uzbek, Hungarian, Serbian (Latin), Indonesian, Occitan, Icelandic, Lithuanian, Maori, Malay, Dutch, Norwegian, Polish, Slovak, Slovenian, Albanian, Swedish, Swahili, Tagalog, Turkish, Latin, Azerbaijani, Kurdish, Latvian, Maltese, Pali, Romanian, Vietnamese, Finnish, Basque, Galician, Luxembourgish, Romansh, Catalan, Quechua
arabic	Arabic script (阿拉伯语系)	Arabic, Persian, Uyghur, Urdu, Pashto, Kurdish, Sindhi, Balochi, English
cyrillic	Cyrillic script (西里尔语系)	Russian, Belarusian, Ukrainian, Serbian (Cyrillic), Bulgarian, Mongolian, Abkhazian, Adyghe, Kabardian, Avar, Dargin, Ingush, Chechen, Lak, Lezgin, Tabasaran, Kazakh, Kyrgyz, Tajik, Macedonian, Tatar, Chuvash, Bashkir, Malian, Moldovan, Udmurt, Komi, Ossetian, Buryat, Kalmyk, Tuvan, Sakha, Karakalpak, English
east_slavic	East Slavic (东斯拉夫语系)	Russian, Belarusian, Ukrainian, English
devanagari	Devanagari script (天城文语系)	Hindi, Marathi, Nepali, Bihari, Maithili, Angika, Bhojpuri, Magahi, Santali, Newari, Konkani, Sanskrit, Haryanvi, English