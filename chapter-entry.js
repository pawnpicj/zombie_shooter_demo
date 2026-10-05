import {clearTransfer,storeTransfer,createTransfer,standaloneTransfer} from './chapter-transfer.mjs';
await clearTransfer();
async function enter(payload){try{await storeTransfer(payload);location.href='./screening-center.html';}catch(error){document.querySelector('#tip').textContent='ส่งต่อ Chapter 1 ไม่สำเร็จ: '+error.message;}}
document.querySelector('#chapterOneStart').onclick=()=>enter(standaloneTransfer());
document.querySelector('#chapterOneContinue').onclick=()=>enter(createTransfer(window.zombieShooter));
