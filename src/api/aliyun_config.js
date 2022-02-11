
import ossClient from '@/method/aliyun.oss.client'
/**
* 初始化
*/
async function init() {

    //获取阿里云token  这里是后台返回来的数据
    const aliyun = {
        Region: 'e-e-sports.oss-cn-hongkong.aliyuncs.com',
        AccessKeyId: 'LTAI4G8mRXCjyw14xkL41tV7',
        AccessKeySecret: '你的AccessKeySecret',
        Bucket: 'e-e-sports',
        SecurityToken: 'ok55oQJ5EBp0Hdo7Ek6jIeiYaTAC8B'
    };
    // SecurityToken
    const { Region, AccessKeyId, AccessKeySecret, Bucket, } = aliyun && aliyun.data;
    this.uploadConf.region = Region;
    this.uploadConf.accessKeyId = AccessKeyId;
    this.uploadConf.accessKeySecret = AccessKeySecret;
    this.uploadConf.bucket = Bucket;
    this.uploadConf.stsToken = SecurityToken;
}
