# مستندات API درگاه پرداخت زیبال - zibal

v1.0.0

OAS 3.1.1

# Zibal IPG API (درگاه پرداخت زیبال)

Download OpenAPI Document

json

Download OpenAPI Document

yaml

## مقدمه

به راهنمای سرویس درگاه پرداختی اینترنتی (IPG) زیبال خوش آمدید. این مستندات جهت آسانی استفاده شما از سرویس‌های زیبال جمع آوری شده‌اند. در صورت بروز هر گونه سوال با تیم فنی زیبال تماس بگیرید. وظیفه همکاران ما پاسخ به پیام‌های شما در اسرع وقت می‌باشد.

لطفا قبل از پیاده‌سازی به نکات زیر توجه نمایید:

-   API‌ های زیبال RESTful می‌باشند و درخواست‌ها و پاسخ‌ها به صورت JSON‌ رد و بدل می‌شوند.
-   زیبال تنها به درخواست‌هایی که تحت دامنه https ارسال می‌شوند پاسخ خواهد داد.
-   در صورت دریافت هر گونه خطا از جانب زیبال، پس از بررسی مقادیر ارسالی خود، این خطا را به همراه مقادیر ارسالی و مقادیر پاسخ‌ دریافتی را برای ما ارسال کنید. از امکان بروز خطا توسط زیبال باخبریم و به سرعت در راستای حل مشکل قدم برخواهیم داشت!
-   یک حساب کاربری جهت تست تمام قابلیت‌ها و سرویس‌ها تهیه شده‌است. با قراردادن `merchant: zibal` می‌توانید از این حساب استفاده کنید.

## مراحل راه‌اندازی

استفاده و راه‌اندازی سرویس درگاه پرداخت اینترنتی زیبال پیچیده نیست. تنها کافیست چهار مرحله زیر را به‌درستی پیاده کنید!

### ۱. درخواست پرداخت - Request

برای راه‌اندازی درگاه شما، زیبال نیاز به اطلاعات سفارش شما دارد که ارسال آن‌ها از طریق این پایانه ممکن می‌باشد. در جواب این پایانه `trackId` را به‌عنوان شناسه پیگیری پرداخت دریافت خواهید کرد.

### ۲. شروع پرداخت - Start

با ارسال `trackId` به این پایانه صفحه‌ی پرداخت برای شما نمایان می‌شود و شما آماده‌ی پرداخت هستید.

### ۳. تایید پرداخت - Verify

زیبال وضعیت پرداخت هر سفارش را به آدرس `callbackUrl` ای که برای آن سفارش ثبت کرده‌اید ارسال می‌کند. پس از آن نیاز است که شما متد تایید تراکنش را فراخوانی کنید. تایید موفقیت‌آمیز بودن پرداخت از طریق این پایانه میسر است.

### ۴. استعلام پرداخت - Inquiry

در صورتی که در هر کدام از مراحل پرداخت نیاز به دریافت اطلاعات و وضعیت تراکنش وجود داشته باشد، با فراخوانی این سامانه وضعیت کامل تراکنش موردنظر را دریافت خواهید کرد.

با طی شدن مسیر ذکر شده روند پرداخت یک سفارش پایان می‌یابد. مبلغ واریزی از طریق درگاه پرداخت اینترنتی بسته به تنظیمات حساب کاربری شما به حساب(های) تعیین‌شده یا کیف‌پول زیبال شما واریز می‌گردد.

## اعتبارسنجی

زیبال از پارامتر `merchant` جهت اعتبارسنجی درگاه‌های موجود استفاده می‌کند. این اطلاعات پس از ایجاد هر درگاه جدید در پنل کاربری زیبال موجود می‌باشند.

این امکان وجود دارد که درگاه خود را به IP (های) مشخصی محدود کنید.

در صورتی که نیاز به ابطال این اطلاعات دارید و یا این اطلاعات را از دست داده‌اید، با ما تماس بگیرید.

**حساب تستی** پیش از راه‌اندازی و فعال‌سازی درگاه شما می‌توانید با قراردادن `merchant: zibal` تمام امکانات و سرویس‌ها را آزمایش کنید. تمامی درخواست‌های ارسالی به زیبال بایستی حاوی اطلاعات احراز هویت باشند:

```json
{
  "merchant": "zibal",
  // OTHER FIELDS
} ```
```

Server

Server:https://gateway.zibal.ir

سرور اصلی درگاه پرداخت زیبال

Client Libraries

Shell

Ruby

Node.js

PHP

Python

More Select from all clients

Shell Curl

## درخواست پرداخت

​Copy link

از این پایانه جهت ارسال اطلاعات سفارش و ثبت آن در سیستم زیبال استفاده کنید.

درخواست پرداخت Operations

-   post/v1/request

### درخواست پرداخت

​Copy link

از این پایانه جهت ارسال اطلاعات سفارش و ثبت آن در سیستم زیبال استفاده کنید. در جواب این پایانه `trackId` را به‌عنوان شناسه پیگیری پرداخت دریافت خواهید کرد.

Body

required

application/json

-   amountCopy link to amount
    
    Type: integerFormat: int64
    
    required
    
    Example
    
    160000
    
    مبلغ کل سفارش (به ریال)
    
-   callbackUrlCopy link to callbackUrl
    
    Type: string
    
    required
    
    Example
    
    http://yourapiurl.com/callback.php
    
    آدرسی از سایت پذیرنده که زیبال اطلاعات پرداخت را به آن ارسال خواهد کرد.
    
-   merchantCopy link to merchant
    
    Type: string
    
    required
    
    Example
    
    zibal
    
    ضروری جهت احراز هویت. برای تست از `zibal` استفاده کنید.
    
-   allowedCardsCopy link to allowedCards
    
    Type: array string\[\]
    
    چنانچه تمایل دارید کاربر فقط از شماره کارت های مشخصی بتواند پرداخت کند لیست کارت (های) 16 رقمی را ارسال کنید.
    
-   checkMobileWithCardCopy link to checkMobileWithCard
    
    Type: boolean
    
    تطبیق شماره کارت و موبایل ارسال شده
    
-   descriptionCopy link to description
    
    Type: string
    
    Example
    
    Hello World!
    
    توضیحات مربوط به سفارش (در گزارشات مختلف نشان‌داده خواهند شد)
    
-   feeModeCopy link to feeMode
    
    Type: integer
    
    `0`: کسر از تراکنش `1`: کسر کارمزد از کیف پول متصل به درگاه (در پرداختیاری پشتیبانی نمی‌شود)
    
-   mobileCopy link to mobile
    
    Type: string
    
    Example
    
    09123456789
    
    با فرستادن شماره موبایل کاربران خود، شماره کارت‌های ثبت‌شده مشتریان در درگاه پرداخت جهت انتخاب ظاهر می‌شوند.
    
-   multiplexingInfosCopy link to multiplexingInfos
    
    Type: array object\[\]
    
    لیستی از آیتم‌های تسهیم
    
    Show Child Attributesfor multiplexingInfos
    
-   nationalCodeCopy link to nationalCode
    
    Type: string
    
    کد ملی (nationalCode) اختیاری و ۱۰ رقمی است. در صورت ارسال این فیلد، کد ملی صاحب کارت با کد ملی وارد شده تطبیق داده می‌شود و در صورت عدم تطابق، از انجام تراکنش جلوگیری خواهد شد.
    
-   orderIdCopy link to orderId
    
    Type: string
    
    Example
    
    ZBL-7799
    
    شناسه سفارش منحصربه‌فرد شما (اختیاری - در گزارشات استفاده می‌شوند)
    
-   percentModeCopy link to percentMode
    
    Type: integer
    
    در صورتی که نحوه تسهیم مبلغ شما به‌صورت درصدی می‌باشد، این مقدار را 1 ارسال کنید. (پیش‌فرض :‌ 0)
    

Responses

-   200
    
    درخواست با موفقیت انجام شد
    
    application/json
    

Request Example for post/v1/request

Shell Curl

```curl
curl https://gateway.zibal.ir/v1/request \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "merchant": "zibal",
  "amount": 160000,
  "callbackUrl": "http://yourapiurl.com/callback.php",
  "description": "Hello World!",
  "orderId": "ZBL-7799",
  "mobile": "09123456789"
}'
```

نمونه درخواست پرداخت (عادی)

Test Request(post /v1/request)

Status: 200

Show Schema 

```json
{
  "trackId": 15966442233311,
  "result": 100,
  "message": "success"
}
```

درخواست با موفقیت انجام شد

## شروع به پرداخت

​Copy link

از این پایانه جهت نمایان شدن صفحه‌ی پرداخت و شروع به پرداخت استفاده کنید.

شروع به پرداخت Operations

-   get/start/{trackId}

### شروع به پرداخت

​Copy link

شما می‌بایست trackId تراکنش (که در قسمت قبل دریافت کرده‌اید) را در url روبرو قرار داده و سپس کاربر را به ‌آن هدایت کنید، پس از باز شدن این آدرس در مرورگر، به درگاه پرداخت زیبال منتقل خواهید شد.

**نکته مهم: ارسال Referrer الزامی است.**

درخواست شروع پرداخت باید همراه با هدر `Referer` ارسال شود و دامنه آن با وب‌سایت ثبت‌شده درگاه شما مطابقت داشته باشد؛ در غیر این صورت کاربر به درگاه پرداخت منتقل نخواهد شد.

> توجه: نام این هدر طبق استاندارد HTTP همان `Referer` (با یک r) است و نباید `Referrer` نوشته شود؛ این غلط املایی از ابتدا در استاندارد HTTP ثبت شده و به همین شکل باقی مانده است.

-   **وب‌سایت‌ها:** اگر کاربر را از داخل سایت خود به این آدرس هدایت کنید، مرورگر به‌صورت خودکار هدر `Referer` را ارسال می‌کند و نیازی به اقدام اضافه نیست.
-   **اپلیکیشن‌های موبایل و بات‌ها:** در این حالت هدر `Referer` به‌صورت خودکار ارسال نمی‌شود و باید آن را به‌صورت دستی تنظیم کنید. برای آشنایی با نحوه صحیح تنظیم آن، [**راهنمای تنظیم Referrer**](https://help.zibal.ir/article/why-referrer-header-is-required) را مطالعه کنید.

«نمونه درخواست از طریق مرورگر» و «نمونه درخواست از طریق اپلیکیشن موبایل» را می‌توانید از منوی پایین باکس نمونه درخواست روبرو انتخاب و مشاهده کنید.

Path Parameters

-   trackIdCopy link to trackId
    
    Type: string
    
    required
    
    شناسه پیگیری پرداخت دریافت شده از مرحله Request
    

Headers

-   RefererCopy link to Referer
    
    Type: string
    
    required
    
    Examples
    
    https://yourwebsite.comandroid-app://com.example.yourapp
    
    الزامی. در وب‌سایت‌ها توسط مرورگر به‌صورت خودکار ارسال می‌شود؛ در اپلیکیشن‌های موبایل و بات‌ها باید به‌صورت دستی تنظیم شود (مطابق **راهنمای تنظیم Referrer**). دامنه آن باید با وب‌سایت ثبت‌شده درگاه مطابقت داشته باشد.
    

Body

text/plain

این درخواست بدنه (Body) ندارد؛ نمونه‌های بالا صرفا نحوه ارسال هدر Referer را در دو حالت مرورگر و اپلیکیشن موبایل نشان می‌دهند.

Request Example for get/start/_{trackId}_

Shell Curl

```curl
curl 'https://gateway.zibal.ir/start/{trackId}' \
  --header 'Referer: https://yourwebsite.com'
```

نمونه درخواست از طریق مرورگر

Test Request(get /start/{trackId})

## Callback

​Copy link

زیبال اطلاعات پرداخت یک سفارش را در زمان تغییر وضعیت به `callbackUrl` ثبت‌شده برای آن سفارش ارسال می‌کند.

این اطلاعات به صورت Query String و از طریق متد `GET` برای `callbackUrl` ارسال می‌شوند.

**برای پایان دادن به جلسه پرداخت یک سفارش در صورت موفقیت‌آمیز بودن پرداخت، حتما از طریق پایانه‌ی تایید پرداخت‌ اقدام به تایید اطلاعات دریافتی نمایید.**

### بدنه Callback

پارامتر

توضیحات

success

در صورت موفقیت‌آمیز بودن تراکنش 1، در غیر این‌صورت 0 می‌باشد.

trackId

شناسه پیگیری جلسه‌ی پرداخت

orderId

شناسه سفارش ارسال شده در هنگام درخواست پرداخت (در صورت ارسال)

status

وضعیت پرداخت (از طریق بخش جداول، جدول وضعیت‌ها می‌توانید مقادیر status را مشاهده نمایید)

#### مثال

`https://yourcallbackurl.com/callback?trackId=9900&success=1&status=2&orderId=1`

## تایید پرداخت

​Copy link

از این پایانه جهت تایید موفقیت‌آمیز بودن پرداخت و پایان دادن به یک جلسه‌ی پرداخت استفاده نمایید.

تایید پرداخت Operations

-   post/v1/verify

### تایید پرداخت

​Copy link

از این پایانه جهت تایید موفقیت‌آمیز بودن پرداخت و پایان دادن به یک جلسه‌ی پرداخت استفاده نمایید.

**تایید پرداخت** همان‌طور که قبلا اشاره شد زیبال با ارسال اطلاعات پرداخت به `callbackUrl` ثبت‌شده، شما را از وضعیت یک پرداخت مطلع می‌سازد. این پایانه جهت اطمینان زیبال از دریافت این اطلاعات توسط شما و خاتمه‌دادن پروسه پرداخت سفارش تعبیه شده‌است.

Body

required

application/json

-   merchantCopy link to merchant
    
    Type: string
    
    required
    
    Example
    
    zibal
    
    ضروری جهت احراز هویت. برای تست از `zibal` استفاده کنید.
    
-   trackIdCopy link to trackId
    
    Type: integerFormat: int64
    
    required
    
    Example
    
    15966442233311
    
    شناسه‌ی جلسه‌ی پرداختی که قصد تایید آن را دارید.
    

Responses

-   200
    
    درخواست با موفقیت انجام شد
    
    application/json
    

Request Example for post/v1/verify

Shell Curl

```curl
curl https://gateway.zibal.ir/v1/verify \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "merchant": "zibal",
  "trackId": 15966442233311
}'
```

Test Request(post /v1/verify)

Status: 200

Show Schema 

```json
{
  "paidAt": "2018-03-25T23:43:01.053000",
  "amount": 1600,
  "result": 100,
  "status": 1,
  "refNumber": 12312,
  "description": "Hello World!",
  "cardNumber": "62741****44",
  "orderId": "2211",
  "message": "success"
}
```

درخواست با موفقیت انجام شد

نمونه پاسخ تایید پرداخت (عادی)

## استعلام پرداخت

​Copy link

از این پایانه جهت استعلام پرداخت و دریافت گزارش یک جلسه‌ی پرداخت استفاده نمایید.

استعلام پرداخت Operations

-   post/v1/inquiry

### استعلام پرداخت

​Copy link

از این پایانه جهت استعلام پرداخت و دریافت گزارش یک جلسه‌ی پرداخت استفاده نمایید.

Body

required

application/json

-   merchantCopy link to merchant
    
    Type: string
    
    required
    
    Example
    
    zibal
    
    ضروری جهت احراز هویت. برای تست از `zibal` استفاده کنید.
    
-   trackIdCopy link to trackId
    
    Type: integerFormat: int64
    
    required
    
    Example
    
    15966442233311
    
    شناسه‌ی جلسه‌ی پرداختی که قصد دریافت گزارش آن را دارید.
    

Responses

-   200
    
    درخواست با موفقیت انجام شد
    
    application/json
    

Request Example for post/v1/inquiry

Shell Curl

```curl
curl https://gateway.zibal.ir/v1/inquiry \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "merchant": "zibal",
  "trackId": 15966442233311
}'
```

Test Request(post /v1/inquiry)

Status: 200

Show Schema 

```json
{
  "message": "success",
  "result": 100,
  "refNumber": 12312,
  "paidAt": "2022-07-06T14:18:21.742000",
  "verifiedAt": "2022-07-06T14:18:21.742000",
  "status": 1,
  "amount": 10000,
  "orderId": "231",
  "description": "Hello World !",
  "cardNumber": "62741****44",
  "multiplexingInfos": [],
  "wage": 0,
  "createdAt": "2022-07-06T14:17:52.918000"
}
```

درخواست با موفقیت انجام شد

نمونه پاسخ استعلام پرداخت (عادی)

## متد Lazy

​Copy link

در صورت استفاده از متد وریفای سمت پذیرنده، در صورتی که پس از ۲۰ دقیقه پس از پرداخت تراکنش در درگاه پرداخت، تاییدیه پرداخت ارسال نشود، مبلغ تراکنش به شماره کارت پرداختی بازگشت داده می‌شود. دیگر تفاوت این روش با روش عادی در پارامتر‌های ارسالی و دریافتی می‌باشد.

متد Lazy Operations

-   post/request/lazy
-   post/verify

### درخواست پرداخت Lazy

​Copy link

از این پایانه جهت ارسال اطلاعات سفارش و ثبت آن در سیستم زیبال استفاده کنید. در صورت استفاده از متد وریفای سمت پذیرنده، در صورتی که پس از ۲۰ دقیقه پس از پرداخت تراکنش در درگاه پرداخت، تاییدیه پرداخت ارسال نشود، مبلغ تراکنش به شماره کارت پرداختی بازگشت داده می‌شود.

Body

required

application/json

-   amountCopy link to amount
    
    Type: integerFormat: int64
    
    required
    
    Example
    
    160000
    
    مبلغ کل سفارش (به ریال)
    
-   callbackUrlCopy link to callbackUrl
    
    Type: string
    
    required
    
    Example
    
    http://yourapiurl.com/callback.php
    
    آدرسی از سایت پذیرنده که زیبال اطلاعات پرداخت را به آن ارسال خواهد کرد.
    
-   merchantCopy link to merchant
    
    Type: string
    
    required
    
    Example
    
    zibal
    
    ضروری جهت احراز هویت. برای تست از `zibal` استفاده کنید.
    
-   allowedCardsCopy link to allowedCards
    
    Type: array string\[\]
    
    استفاده همزمان از lazy و ارسال پارامتر allowedCards پیشنهاد نمی‌شود.
    
-   checkMobileWithCardCopy link to checkMobileWithCard
    
    Type: boolean
    
    تطبیق شماره کارت و موبایل ارسال شده
    
-   descriptionCopy link to description
    
    Type: string
    
    توضیحات مربوط به سفارش (در گزارشات مختلف نشان‌داده خواهند شد)
    
-   feeModeCopy link to feeMode
    
    Type: integer
    
    `0`: کسر از تراکنش `1`: کسر کارمزد از کیف پول متصل به درگاه (در پرداختیاری پشتیبانی نمی‌شود)
    
-   mobileCopy link to mobile
    
    Type: string
    
    Example
    
    09123456789
    
    با فرستادن شماره موبایل کاربران خود، شماره کارت‌های ثبت‌شده مشتریان در درگاه پرداخت جهت انتخاب ظاهر می‌شوند.
    
-   multiplexingInfosCopy link to multiplexingInfos
    
    Type: array object\[\]
    
    لیستی از آیتم‌های تسهیم
    
    Show Child Attributesfor multiplexingInfos
    
-   nationalCodeCopy link to nationalCode
    
    Type: string
    
    کد ملی (nationalCode) اختیاری و ۱۰ رقمی است. در صورت ارسال این فیلد، کد ملی صاحب کارت با کد ملی وارد شده تطبیق داده می‌شود و در صورت عدم تطابق، از انجام تراکنش جلوگیری خواهد شد.
    
-   orderIdCopy link to orderId
    
    Type: string
    
    شناسه سفارش منحصربه‌فرد شما (اختیاری - در گزارشات استفاده می‌شوند)
    
-   percentModeCopy link to percentMode
    
    Type: integer
    
    در صورتی که نحوه تسهیم مبلغ شما به‌صورت درصدی می‌باشد، این مقدار را 1 ارسال کنید. (پیش‌فرض :‌ 0)
    

Responses

-   200
    
    درخواست با موفقیت انجام شد
    
    application/json
    

Request Example for post/request/lazy

Shell Curl

```curl
curl https://gateway.zibal.ir/request/lazy \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "merchant": "zibal",
  "amount": 160000,
  "callbackUrl": "http://yourapiurl.com/callback.php",
  "description": "Hello World!",
  "orderId": "ZBL-7799",
  "mobile": "09123456789"
}'
```

نمونه درخواست پرداخت Lazy (عادی)

Test Request(post /request/lazy)

Status: 200

Show Schema 

```json
{
  "trackId": 15966442233311,
  "result": 100,
  "message": "success"
}
```

درخواست با موفقیت انجام شد

### تایید پرداخت Lazy

​Copy link

از این پایانه جهت تایید موفقیت‌آمیز بودن پرداخت در روش Lazy استفاده نمایید.

**تایید پرداخت** همان‌طور که قبلا اشاره شد زیبال با ارسال اطلاعات پرداخت به `callbackUrl` ثبت‌شده، شما را از وضعیت یک پرداخت مطلع می‌سازد. این پایانه جهت اطمینان زیبال از دریافت این اطلاعات توسط شما و خاتمه‌دادن پروسه پرداخت سفارش تعبیه شده‌است.

Body

required

application/json

-   merchantCopy link to merchant
    
    Type: string
    
    required
    
    Example
    
    zibal
    
    ضروری جهت احراز هویت. برای تست از `zibal` استفاده کنید.
    
-   trackIdCopy link to trackId
    
    Type: integerFormat: int64
    
    required
    
    Example
    
    15966442233311
    
    شناسه‌ی جلسه‌ی پرداختی که قصد تایید آن را دارید.
    

Responses

-   200
    
    درخواست با موفقیت انجام شد
    
    application/json
    

Request Example for post/verify

Shell Curl

```curl
curl https://gateway.zibal.ir/verify \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "merchant": "zibal",
  "trackId": 15966442233311
}'
```

Test Request(post /verify)

Status: 200

Show Schema 

```json
{
  "paidAt": "2018-03-25T23:43:01.053000",
  "amount": 1600,
  "result": 100,
  "status": 1,
  "refNumber": 12312,
  "description": "Hello World!",
  "cardNumber": "62741****44",
  "orderId": "2211",
  "message": "success"
}
```

درخواست با موفقیت انجام شد

نمونه پاسخ تایید پرداخت Lazy (عادی)

## Callback - Lazy

​Copy link

زیبال اطلاعات پرداخت یک سفارش را در زمان تغییر وضعیت به `callbackUrl` ثبت‌شده برای آن سفارش ارسال می‌کند.

در روش lazy این اطلاعات به صورت JSON و از طریق متد `POST` برای `callbackUrl` ارسال می‌شوند.

**برای پایان دادن به جلسه پرداخت یک سفارش در صورت موفقیت‌آمیز بودن پرداخت، حتما از طریق پایانه‌ی تایید پرداخت‌ اقدام به تایید اطلاعات دریافتی نمایید.**

### بدنه Callback

پارامتر

توضیحات

success

در صورت موفقیت‌آمیز بودن تراکنش 1، در غیر این‌صورت 0 می‌باشد.

trackId

شناسه پیگیری جلسه‌ی پرداخت

orderId

شناسه سفارش ارسال شده در هنگام درخواست پرداخت (در صورت ارسال)

status

تعیین وضعیت سفارش به عهده پذیرنده بوده و سفارش تا زمان تایید دارای وضعیت نیست.

cardNumber

شماره کارت پرداخت کننده (Mask شده)

hashedCardNumber

شماره کارت پرداخت کننده (Hash شده)

#### نمونه JSON ارسالی زیبال

```json
{
  "success": "1",
  "trackId": "15966442233311",
  "orderId": "1234",
  "status": null,
  "cardNumber": "62741****44",
  "hashedCardNumber": "432DA439OSD345"
}  
```

## جداول

​Copy link

### جدول وضعیت‌ها

وضعیت

توضیحات

\-1

در انتظار پردخت

\-2

خطای داخلی

1

پرداخت شده - تاییدشده

2

پرداخت شده - تاییدنشده

3

لغوشده توسط کاربر

4

‌شماره کارت نامعتبر می‌باشد.

5

‌موجودی حساب کافی نمی‌باشد.

6

رمز واردشده اشتباه می‌باشد.

7

‌تعداد درخواست‌ها بیش از حد مجاز می‌باشد.

8

‌تعداد پرداخت اینترنتی روزانه بیش از حد مجاز می‌باشد.

9

مبلغ پرداخت اینترنتی روزانه بیش از حد مجاز می‌باشد.

10

‌صادرکننده‌ی کارت نامعتبر می‌باشد.

11

‌خطای سوییچ

12

کارت قابل دسترسی نمی‌باشد.

15

تراکنش استرداد شده

16

تراکنش در حال استرداد

18

تراکنش ریورس شده

21

پذیرنده نامعتبر است

### جدول کدهای نتیجه درخواست پرداخت

کد

توضیحات

100

با موفقیت تایید شد.

102

`merchant`یافت نشد.

103

`merchant`غیرفعال / عدم امضا قرارداد درگاه مربوطه

104

`merchant`نامعتبر

105

`amount`بایستی بزرگتر از 1,000 ریال باشد.

106

`callbackUrl`نامعتبر می‌باشد. (شروع با http و یا https)

107

`percentMode`نامعتبر می‌باشد. (تنها 0 و 1 قابل قبول هستند)

108

یک یا چند ذی‌نفع در `multiplexingInfos` نامعتبر می‌باشند.

109

یک یا چند ذی‌نفع در `multiplexingInfos` غیرفعال می‌باشند.

110

`id = self` در `multiplexingInfos` وجود ندارد.

111

`amount` با مجموع سهم‌ها در `multiplexingInfos` برابر نمی‌باشد.

112

موجودی کیف پول کارمزد جهت کسر کارمزد کافی نیست.

113

`amount` مبلغ تراکنش از سقف میزان تراکنش بیشتر است.

114

کدملی ارسالی نامعتبر است.

115

ip شما در پنل کاربری ثبت نشده است.

116

`feeMode` نامعتبر می‌باشد. (تنها عدد صحیح قابل قبول است)

### جدول کدهای نتیجه تایید پرداخت

کد

توضیحات

100

با موفقیت تایید شد.

102

`merchant` یافت نشد.

103

`merchant` غیرفعال

104

`merchant` نامعتبر

201

قبلا تایید شده

202

سفارش پرداخت نشده یا ناموفق بوده است. ( جهت اطلاعات بیشتر جدول وضعیت‌ها را مطالعه کنید)

203

`trackId` نامعتبر می‌باشد.

### جدول کدهای نتیجه استعلام پرداخت

کد

توضیحات

100

با موفقیت گزارش ایجاد شد.

102

`merchant` یافت نشد.

103

`merchant` غیرفعال

104

`merchant` نامعتبر

203

`trackId` نامعتبر می‌باشد.

### جدول کدهای نتیجه درخواست پرداخت Lazy

کد

توضیحات

100

با موفقیت تایید شد.

102

`merchant`یافت نشد.

103

`merchant`غیرفعال / عدم امضا قرارداد درگاه مربوطه

104

`merchant`نامعتبر

105

`amount`بایستی بزرگتر از 1,000 ریال باشد.

106

`callbackUrl`نامعتبر می‌باشد. (شروع با http و یا https)

107

`percentMode`نامعتبر می‌باشد. (تنها 0 و 1 قابل قبول هستند)

108

یک یا چند ذی‌نفع در `multiplexingInfos` نامعتبر می‌باشند.

109

یک یا چند ذی‌نفع در `multiplexingInfos` غیرفعال می‌باشند.

110

`id = self` در `multiplexingInfos` وجود ندارد.

111

`amount` با مجموع سهم‌ها در `multiplexingInfos` برابر نمی‌باشد.

112

موجودی کیف پول کارمزد جهت کسر کارمزد کافی نیست.

113

`amount` مبلغ تراکنش از سقف میزان تراکنش بیشتر است.

114

کدملی ارسالی نامعتبر است.

115

ip شما در پنل کاربری ثبت نشده است.

116

`feeMode` نامعتبر می‌باشد. (تنها عدد صحیح قابل قبول است)

### جدول کدهای نتیجه تایید پرداخت Lazy

کد

توضیحات

100

با موفقیت تایید شد.

102

`merchant` یافت نشد.

103

`merchant` غیرفعال

104

`merchant` نامعتبر

201

قبلا تایید شده

202

سفارش پرداخت نشده یا ناموفق بوده است. (به بخش جداول، جدول وضعیت ها مراجعه کنید)

203

`trackId` نامعتبر می‌باشد.

## نشان اعتماد زیبال

​Copy link

با توجه به لزوم جلب اعتماد مشتریان جهت انجام پرداختی امن و سریع، می‌توانید با قرار دادن کد زیر در قسمتی از وبسایت خود (مانند فوتر وبسایت)، مشتریان خود را از پردازش پرداخت‌ها توسط زیبال مطلع نمایید.

**کد اسکریپت (پیشنهادی)**

```html
<script src="https://zibal.ir/trust/scripts/zibal-trust-v4.js" type="text/javascript"></script> 
```

---

**استفاده در Dark Mode**

```html
<script src="https://zibal.ir/trust/scripts/zibal-trust-v4.js?theme=dark" type="text/javascript"></script>
```

---

پس از قراردادن این تکه کد، نشان اعتماد زیبال به شکل زیر در وبسایت شما نمایش داده خواهد شد.

![پرداخت آنلاین زیبال](https://zibal.ir/trust/assets/1.png) ![پرداخت آنلاین زیبال](https://zibal.ir/trust/assets/2.png)

---

#### نمونه‌ای از تنظیم استایل یا ابعاد برای لوگوی تصویر:

با تغییر مقدار height (که در این مثال 200px در نظر گرفته شده)، می‌توانید ابعاد تصویر را به اندازه‌ی دلخواه تنظیم کنید.

```html
<html lang='en'>  <head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>Document</title>
  <style>
    #zibal{
        margin: auto;
    }
    #zibal img{
      height: 200px!important;
    }
  </style>
</head>
<body>
  <div id='zibal'>
    <script src="https://zibal.ir/trust/scripts/zibal-trust-v4.js" type="text/javascript"></script>
  </div>
</body> 
</html> 
```

---

**استفاده در Next.js** همانطور که میدانید در پروژه های Next.js میبایست از تگ Script استفاده کرد.

```javascript
import Script from "next/script";

<div id='zibal'>
<Script src="https://zibal.ir/trust/scripts/zibal-trust-v4.js" type="text/javascript"/>
</div>
```

#### استفاده به صورت HTML خالص (روش جایگزین)

برای نمایش نماد اعتماد زیبال بدون اسکریپت، می‌توانید از کد زیر استفاده کنید.

در آدرس بالا، مقدار `{SiteName}` را با دامنه سایت خود بدون `https://` جایگزین کنید. برای مثال اگر آدرس سایت شما `https://zibal.ir` است، مقدار نهایی باید `zibal.ir` باشد؛ یعنی لینک نهایی برای این مثال به شکل `https://gateway.zibal.ir/trustMe/zibal.ir` ساخته می‌شود.

```html
<div>
  <a href="https://gateway.zibal.ir/trustMe/{SiteName}" target="_blank" rel="noopener">
    <img style="max-width: 110px; height: auto;" src="https://zibal.ir/trust/assets/2.png" />
  </a>
</div>
```

## اعلان تراکنش‌ها

​Copy link

شما می‌توانید جهت اطلاع از تراکنش‌های موفقیت‌آمیز از ربات تلگرامی زیبال استفاده کنید. تنها کافی‌است وارد [ZibalBot](https://t.me/ZibalBot) شوید و ربات را به حساب کاربری خود متصل نمایید تا تمامی تراکنش‌های تمامی درگاه‌های پرداخت شما، در لحظه به اطلاع شما برسند. ![ZibalBot](https://help.zibal.ir/wp-content/uploads/2026/06/zibalbot.png)