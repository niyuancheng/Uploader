# NiUploader
## 简介
这是一款由TS开发的适用于大文件上传的库，参考```simple-uploader.js```和自己的理解进行了重构，依赖HTML5相关API，对IE9以下浏览器不支持，请选择合适版本的浏览器进行使用，感谢配合。
本库已实现
1. 大文件分片上传
2. 文件断点续传
3. 上传进度详细展示
4. 上传取消和暂停
5. 暂停后可以继续上传文件剩下部分
#### npm地址： www.npmjs.com/package/niuploader
#### github源码: https://github.com/niyuancheng/Uploader
### 我的个人github主页： https://github.com/niyuancheng

## 使用示例
``` js
import Uploader from "niuploader"

let uploader = new Uploader({
    chunkApi:"http://localhost/test",
    fileApi:"http://localhost/test",
    target: "#file",
    ifSendByChunk: true,
    chunkSize:1024,
    autoUpload: true
})

uploader.addEventListener("fileSuccess",(file)=>{
    console.log("所有文件发送成功");
})

uploader.addEventListener("filePercent",(speed,percent,expect)=>{
    console.log('-------------------------------');
    console.log(`传输速度为: ${speed} B/s`);
    console.log(`传输的比例为: ${percent}%`);
    console.log(`预计还需${expect}s`);
    console.log('-------------------------------');})
```

## 相关API
1. __Uploader配置项__
    - chunkApi: 必选参数，用于将大文件的每个切片发送给chunkApi参数的对应后端API接口，参数类型：string

    - fileApi:必选参数，在所有分片都发送完毕后，uploader会给fileApi参数对应的后端接口发送ajax请求，通知后端该文件的所有分片已经传输完毕，可以进行分片整合获得完整的大文件；参数类型：string

    - target：可选参数，传入target之后uploader会托管对应的DOM元素，__注意：target对应的托管元素必须为__```<input type="file" />```否则会报错，参数类型: string类型的id或者className，或者直接传入对应的DOM元素：HTMLInputElement。

    - workerPath: 可选参数，用于在工作者线程中加载指定的脚本来生成file和chunk的id,推荐使用本库自带的JS脚本hash_worker.js,可根据自己的情况修改路径，__但是一定要引入hash_worker.js，否则将无法正常生成ID!!!__

    ```js
    workerPath: "path/node_modules/niuploader/hash_worker.js"
    ```
    - ifSendByChunk: 可选参数，表示是否要对文件进行分片传输，默认为true。

    - chunkSize: 可选参数，表示每一个分片的大小，默认为1024B

    - autoUpload：可选参数，表示是否自动上传文件，默认为true

2. __事件监听__

    ```js
    uploader.addEvenListener(event,(...args)=>{
        //ToDo
    })
    ```

    1. fileProgress--文件上传过程中不断触发
        fileItem -- 对应分片所属的具体文件信息
        fileItem.id -- 文件的ID值
        fileItem.size -- 文件的大小
        fileItem.file -- 传输的文件对象
    ```js
    uploader.addEvenListener("fileProgress",(fileItem,uploadedSize,totalSize)=>{
        //ToDo
    })
    ```

    2.  fileAbort--文件上传取消或者暂停时触发
    ```js
    uploader.addEvenListener("fileAbort",(fileItem)=>{
       
    })
    ```

    3. fileError -- 文件上传错误触发

    4. fileSuccess -- 文件上传成功触发

    5. fileComplete -- 文件的上传过程结束时触发，可能为abort,erro或者success

    6. filePercent -- __根据fileProgress单独封装出的进度事件，可以帮助使用者在视图层中具体显示文件的上传进度,上传时间，预计上传时间等有效信息__
    ```js
    uploader.addEvenListener("filePercent",(speed, percent, expect) => {
        console.log('-------------------------------');
        console.log(`传输速度为: ${speed} B/s`);
        console.log(`传输的比例为: ${percent}%`);
        console.log(`预计还需${expect}s`);
        console.log('-------------------------------');
    })
    ```

    7.  chunkSend -- 某一分片开始上传时触发
        chunkItem -- 对应分片的信息
        chunkItem.id -- 分片的ID值
        chunkItem.chunk -- 分片的二进制流信息
        chunkItem.precent -- 分片的上传进度
        chunkItem.size -- 分片的大小
        
    ```js
    upoloader.addEventListener("chunkSend",(fileItem,chunkItem) => {

    })
    ```

    8. chunkProgress --某个分片在上传过程中不断触发

    9. chunkSuccess -- 同fileSuccess
    10. chunkAbort -- 同fileAbort
    11. chunkError -- 同fileError
    12. chunkComplete -- 同chunkComplete
3. 实例方法
    1. assign:如果用户不传入target，之后可以自行调用assign让uploader去托管指定的元素，传入参数类型与target配置项相同
    ```js
    uploader.assign(target)
    ```
    2. clearChunkStorage:清除本地存储的已经上传的文件的分片信息
    ```js
    uploader.clearChunkStorage()
    ```
    3. uploadFile:如果设置autoUpload为false的话，用户可以自行调用uploadFile上传文件
    ```js
    let fileInput = document.getElemenetById("file");
    fileInput.addEventListener("change",(e) => {
        let files = e.target.files;
        for(let file of [...files]) {
            uploader.uploadFile(file);
        }
    })
    ```

    4.cancelUploadFile:暂停文件的上传，此时uploader会abort所有还在上传中的切片，暂停后继续上传的话则只会上传未成功上传的切片，做到了断点上传（暂停后继续上传的话需要手动调用uploadFile方法）
    ```js
    uploader.addEventListener("chunkSuccess",(fileItem,chunkItem,response)=>{
        uploader.cancelUploadFile(fileItem.file);
    })

    //继续上传
    function continueUpload(file: File) {
        uploader.uploadFile(file)
    }
    ```
    
    5.formatSize ：用于在进度事件中格式化字节大小
    ```js
    let size = 1024; //1024B
    console.log(uploader.formatSize(size)) // 1KB
    ```
    