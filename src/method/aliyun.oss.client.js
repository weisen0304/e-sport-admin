
/**     
 * 阿里云oss上传工具
 * @deprecated conf:{
 * region:null
 * accessKeyId:null,
 * accrsssKeySecret:''
 * bucket:null
 * stsToken:'' 
 * }
 */
import OSS from 'ali-oss';
export default (conf) => {
    return new OSS(conf);
};