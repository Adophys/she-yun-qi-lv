/**
 * 扫码解锁 API。
 */
import { http } from './http'

/**
 * 扫码/NFC 识别并解锁文化卡片（需登录、幂等）。
 * @param {string} code 二维码码值或 NFC 标签内容
 * @returns {Promise<{matchedItemId:string, matchedItemName:string, nodeId:string, nodeName:string, isNew:boolean, gainedPoints:number, gainedFragment:string}>}
 */
export async function scanRecognize(code) {
  return http.post('/scan/recognize', { code })
}
