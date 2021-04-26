var fs = require('fs');

//readFileSync

// ABC 출력 - 동기
// console.log('A');
// var result = fs.readFileSync('syntax/sample.txt', 'utf-8');
// console.log(result);
// console.log('C');

console.log('=============================================');

//ACB 출력 - 비동기(성능이 더 우수하다.)
console.log('A');
fs.readFile('syntax/sample.txt', 'utf-8', function(err, result){
    // sample.txt를 다 읽은 다음에 뒤에 function이 callback으로 실행됨.
    console.log(result);
});
console.log('C');