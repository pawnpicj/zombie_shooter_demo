export const CAMPAIGN = [
  {
    id:'security-log', label:'01 / CONTAINMENT BREACH', name:'สัญญาณสุดท้าย',
    objective:'กำจัดผู้ติดเชื้อ แล้วกู้บันทึกจากคอนโซลรักษาความปลอดภัย',
    cleared:'ไปยังคอนโซล SECURITY ทางซ้ายบน แล้วกด E เพื่อกู้บันทึก',
    point:{x:-16,z:-15}, marker:'SECURITY',
    speaker:'บันทึกเสียง / ดร.มีรา',
    report:'Virus X เป็นหัวใจของโครงการ REGEN-X เราต้องการฟื้นฟูเนื้อเยื่อให้ผู้ป่วยที่หมดทางรักษา แต่การทดลองล่าสุดทำให้ผู้รับเชื้อสูญเสียการควบคุมตนเอง ระบบกักกันล้มเหลว เชื้อแพร่ไปทั่วแล็บ… ถ้ามีใครได้ยิน อย่าทำลายข้อมูลการรักษา มันอาจเป็นโอกาสเดียวของพวกเขา',
    next:'John พบว่าผู้ติดเชื้อเคยเป็นผู้ป่วยและเจ้าหน้าที่ เขาต้องไปยังศูนย์วิจัยเพื่อกู้สูตรที่ยังไม่สมบูรณ์',
    action:'เข้าสู่ศูนย์วิจัย →'
  },
  {
    id:'formula-x', label:'02 / REGEN-X ARCHIVE', name:'สูตรที่ยังมีความหวัง',
    objective:'กำจัดผู้ติดเชื้อ แล้วกู้สูตรรักษาและตัวอย่าง Virus X จากศูนย์วิจัย',
    cleared:'ไปยังคอนโซล RESEARCH ทางขวาบน แล้วกด E เพื่อเก็บสูตรและตัวอย่าง',
    point:{x:16,z:-15}, marker:'RESEARCH',
    speaker:'JOHN VALENTINE / วิทยุหน่วยรบพิเศษ',
    report:'ศูนย์บัญชาการ นี่ Valentine ผมได้แฟ้ม REGEN-X และตัวอย่าง Virus X แล้ว ผลวิจัยระบุว่าสูตรเดิมช่วยรักษาผู้ป่วยได้ แต่ยังควบคุมผลต่อระบบประสาทไม่ได้ เราต้องส่งข้อมูลให้ทีมแพทย์ตรวจสอบ ผมจะรักษาตัวอย่างไว้และมุ่งหน้าไปยังจุดถอนกำลัง',
    next:'สัญญาณชีวภาพในแล็บเพิ่มขึ้น หน่วยสนับสนุนเปิดประตูถอนกำลังได้ แต่ John ต้องฝ่าฝูงผู้ติดเชื้อออกไปเอง',
    action:'ไปยังจุดถอนกำลัง →'
  },
  {
    id:'extracted', label:'03 / LAST EXTRACTION', name:'ออกไปพร้อมความหวัง',
    objective:'กำจัดฝูงสุดท้าย แล้วนำสูตรและตัวอย่างเชื้อไปยังประตูถอนกำลัง',
    cleared:'ไปยังจุด EXTRACTION ด้านล่าง แล้วกด E เพื่อออกจากแล็บ',
    point:{x:0,z:20}, marker:'EXTRACTION',
    speaker:'ศูนย์บัญชาการ / ภารกิจสำเร็จ',
    report:'John Valentine ออกจากแล็บพร้อมข้อมูล REGEN-X และตัวอย่าง Virus X ได้สำเร็จ พื้นที่ถูกปิดกักกัน ทีมแพทย์เริ่มศึกษาวิธีทำให้สูตรรักษาปลอดภัยอีกครั้ง แม้ยังไม่มีคำตอบว่าผู้ติดเชื้อจะกลับมาเป็นมนุษย์ได้หรือไม่ แต่ความหวังของผู้ป่วยยังไม่สูญหาย',
    next:'จบตอนนำร่อง — PROJECT REGEN-X',
    action:'เริ่มภารกิจใหม่ →'
  }
];
export function createCampaign(){return {chapter:0,phase:'combat',evidence:[],complete:false};}
export function clearCampaignWave(progress){
  if(progress.complete || progress.phase!=='combat')return false;
  progress.phase='objective';return true;
}
export function interactCampaign(progress,position){
  if(progress.complete || progress.phase!=='objective')return false;
  const chapter=CAMPAIGN[progress.chapter];
  if(Math.hypot(position.x-chapter.point.x,position.z-chapter.point.z)>2.8)return false;
  progress.evidence.push(chapter.id);
  if(progress.chapter===CAMPAIGN.length-1){progress.complete=true;progress.phase='complete';}
  else {progress.chapter++;progress.phase='combat';}
  return true;
}
