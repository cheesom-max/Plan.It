const fs = require('fs');
const j = JSON.parse(fs.readFileSync('spain_itinerary.json', 'utf8'));

console.log('=== 퀄리티 분석 ===\n');

// 기본 정보
console.log('【제목】', j.title);
console.log('【요약】', j.summary);
console.log('【예상 일일 예산】', j.estimated_daily_budget?.amount?.toLocaleString(), j.estimated_daily_budget?.currency);
console.log('');

// Day 1 상세 분석
console.log('═══════════════════════════════════════');
console.log('【Day 1 상세 분석】', j.days[0].date, '-', j.days[0].location);
console.log('테마:', j.days[0].day_theme);
console.log('총 도보 거리:', j.days[0].total_walking_distance);
j.days[0].schedule.forEach((s, i) => {
  console.log(`\n[일정 ${i+1}] ${s.time} - ${s.category} (${s.duration})`);
  console.log('장소:', s.place?.name_ko || s.options?.[0]?.name);
  console.log('설명:', s.description?.substring(0, 150) + '...');
  if(s.tips) console.log('팁:', s.tips?.substring(0, 100) + '...');
});

// Day 10 상세 분석 (중간)
console.log('\n═══════════════════════════════════════');
console.log('【Day 10 상세 분석】', j.days[9].date, '-', j.days[9].location);
console.log('테마:', j.days[9].day_theme);
j.days[9].schedule.forEach((s, i) => {
  console.log(`[일정 ${i+1}] ${s.time} - ${s.place?.name_ko || s.options?.[0]?.name || s.category}`);
});

// Day 20 상세 분석 (마지막)
console.log('\n═══════════════════════════════════════');
console.log('【Day 20 상세 분석】', j.days[19].date, '-', j.days[19].location);
console.log('테마:', j.days[19].day_theme);
j.days[19].schedule.forEach((s, i) => {
  console.log(`[일정 ${i+1}] ${s.time} - ${s.place?.name_ko || s.options?.[0]?.name || s.category}`);
  console.log('  설명:', s.description?.substring(0, 120) + '...');
});

// 여행 팁
console.log('\n═══════════════════════════════════════');
console.log('【여행 팁】');
j.tips?.forEach((t, i) => console.log(`${i+1}. ${t}`));

// 통계
console.log('\n═══════════════════════════════════════');
console.log('【통계】');
const totalSchedules = j.days.reduce((sum, d) => sum + (d.schedule?.length || 0), 0);
console.log('총 일정 수:', totalSchedules);
console.log('일당 평균 일정:', (totalSchedules / 20).toFixed(1));

const mealCount = j.days.reduce((sum, d) => sum + d.schedule.filter(s => s.meal_type).length, 0);
console.log('식사 일정 수:', mealCount);

const descriptions = j.days.flatMap(d => d.schedule.map(s => s.description?.length || 0));
console.log('설명 평균 길이:', Math.round(descriptions.reduce((a,b)=>a+b,0)/descriptions.length), '자');
