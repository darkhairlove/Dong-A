
let subject_name = "math"
let dataset = dataset_math;
// code로 해당하는 name 찾기
function getNameByCode(x) {
    for (let i = 0; i < dataset.length; i++) {
        const lv1Data = dataset[i].data;
        for (let j = 0; j < lv1Data.length; j++) {
            const lv2Data = lv1Data[j].data;
            for (let k = 0; k < lv2Data.length; k++) {
                if (lv2Data[k].code === x) {
                    return lv2Data[k].name;
                }
            }
        }
    }
    return null;
}

// 선-후로 관련된 학습 수 세기
function countRelated(code, count, direction) {
    dataset.forEach(function (lv1Data) {
        lv1Data.data.forEach(function (lv2Data) {
            lv2Data.data.forEach(function (data) {
                if (data.code === code && data[direction]) {
                    count += data[direction].split(',').length;
                    data[direction].split(',').forEach(function (relatedCode) {
                        count = countRelated(relatedCode.trim(), count, direction);
                    });
                }
            });
        });
    });
    return count;
}

// 코드에 해당하는 부모 레벨 명 리턴하기
function findLvName(code) {
    let lv1 = '';
    let lv2 = '';
    dataset.forEach((data) => {
        data.data.forEach((subData) => {
            subData.data.forEach((item) => {
                if (item.code === code) {
                    lv2 = subData.lv2;
                    lv1 = data.lv1;
                }
            });
        });
    });
    return { lv1, lv2 };
}

let except_level = ['집합과 명제', '시각 자료 활용하기', '계획 공유하기', '약속 정하기'] // exception for making another column by main topic
// dataset 기반으로 페이지에 테이블 추가하기
function addRowsToTable(tableSelector, dataset_set, isReverse) {
    dataset_set.forEach(function (lv1Data) {
        let group_button = `<div><span class='all'>전체 연결</span></div>`
        let lv1 = `
            <div class="table group">
                <div class="lv1 lv">${lv1Data.lv1}${group_button}</div>
                <div class="lv-group" group="${lv1Data.lv1}">
            </div>
        `;
        $(tableSelector).append(lv1);
        lv1Data.data.forEach(function (lv2Data) {
            let lv2 = `
                <div class="group">
                    <div class="lv2 lv">${lv2Data.lv2}${group_button}</div>    
                    <div class="group" group="${lv2Data.lv2}">
                    </div>
                </div>
            `;
            if (except_level.includes(lv2Data.lv2)) { // exception - lv2
                $(tableSelector).find(`.group`).parent().last().append(lv2);
            }
            else{
                $(tableSelector).find(`[group="${lv1Data.lv1}"]`).last().append(lv2);
            } 
            let lv2data_dataset = lv2Data.data;
            if (isReverse) {
                lv2data_dataset = lv2data_dataset.reverse();
            }
            lv2data_dataset.forEach(function (data, index) {

                
                let pre = data.pre ? data.pre.split(',').map(function(p) {
                    let relatedCount = countRelated(p.trim(), 0, 'pre');
                    let relatedNested = ''
                    if (relatedCount > 0) {
                        relatedNested = 'nested';
                    }
                    return `<i class="${relatedNested} fa-solid fa-play fa-flip-horizontal ` + p.trim().slice(0, 2) + '"></i> '
                }).join('') : '';

                let follow = data.follow ? data.follow.split(',').map(function(p) {
                    let relatedCount = countRelated(p.trim(), 0, 'follow');
                    let relatedNested = ''
                    if (relatedCount > 0) {
                        relatedNested = 'nested';
                    }
                    return `<i class="${relatedNested} fa-solid fa-play ` + p.trim().slice(0, 2) + '"></i> '
                }).join('') : '';
                
                
                let pre_text = data.pre ? `<div class="t">선수학습</div><div class="bullet_group">` + data.pre.split(',').map(p => {
                    const name = getNameByCode(p.trim());
                    let relatedCount = countRelated(p.trim(), 0, 'pre') + 1;
                    let count = `<span class='count'>${relatedCount}</span>`
                    if (relatedCount < 2) {count = '';}

                    if(name) {return `
                        <i class="fa-solid fa-play fa-flip-horizontal ${p.trim().slice(0,2)}"></i> 
                        <div class='popup_bullet ${p.trim().slice(0,2)}' relatedCode='${p.trim()}' direction='pre'>
                            <div class='popup_bullet_name'><span class='${p.trim().slice(0,2)}'>${p.trim().slice(0,2)}</span>${name}${count}</div>
                            <div class='popup_bullet_code'>${p.trim()}</div>
                        </div>
                            `;}
                }).join('</div><div class="bullet_group">') + '</div>' : '';

                let follow_text = data.follow ? `<div class="t">후속학습</div><div class="bullet_group">` + data.follow.split(',').map(f => {
                    const name = getNameByCode(f.trim());
                    let relatedCount = countRelated(f.trim(), 0, 'follow') + 1;
                    let count = `<span class='count'>${relatedCount}</span>`
                    if (relatedCount < 2) {count = '';}
                    
                    if(name) {return `
                        <i class="fa-solid fa-play ${f.trim().slice(0,2)}"></i> 
                        <div class='popup_bullet ${f.trim().slice(0,2)}' relatedCode='${f.trim()}' direction='follow'>
                            <div class='popup_bullet_name'><span class='${f.trim().slice(0,2)}'>${f.trim().slice(0,2)}</span>${name}${count}</div>
                            <div class='popup_bullet_code'>${f.trim()}</div>
                        </div>
                            `;}
                }).join('</div><div class="bullet_group">') + '</div>' : '';

                let popup = ''
                if (data.pre || data.follow) {
                    popup = `
                    <div class="popup">
                        <div class="connect_all">전체 연결<span><i class="fa-solid fa-arrows-split-up-and-left fa-rotate-180"></i></span></div>
                        ${pre_text}
                        ${follow_text}
                    </div>
                `;
                }
                let level_class = 'elem';
                if (data.code.slice(0, 1) != 'E') {
                    level_class = 'high';
                }
                let row = `
                    <div class="cell ${level_class}" cell_code="${data.code}">
                        <div class="cell_number ${data.code.slice(0, 2)}">${data.code.slice(0, 2)}</div>
                        <div class="cell_content">  
                            <div class="cell_name ${level_class}">${data.name}</div>
                            <div class="cell_info">
                                <div class="cell_info_left">
                                    ${data.code.slice(0, -3)}<span class='code_c'>${data.code.slice(-3)}</span> / ${data.archive}
                                </div>
                                <div class="cell_info_right">
                                    <span class="pre">${pre}</span>
                                    <span class="follow">${follow}</span>
                                        ${popup}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                $(tableSelector).find(`[group="${lv2Data.lv2}"]`).last().append(row);
            });
        });
    })
    $('#table-group').append('<div class="right-margin"></div>');
}

function addtionalInfo() {
    $('.lv').each(function() { 
        let preCount = 0;
        let followCount = 0;
        let pre = '', follow = '';
        $(this).parent().find('.group').find('.popup_bullet').each(function() {
            const direction = $(this).attr('direction');
            if (direction === 'pre') {
                preCount++;
            } else if (direction === 'follow') {
                followCount++;
            }
        });
        if (preCount > 0) {
            pre = `<div>${preCount} <i class="fa-solid fa-play fa-flip-horizontal"></i></div>`;
        }
        if (followCount > 0) {
            follow = `<div><i class="fa-solid fa-play"></i> ${followCount}</div>`;
        }
        
        $(this).append(`<div class='count'>${pre}${follow}</div>`);
    });

    $('.cell_number').each(function() {
        const code = $(this).parent().attr('cell_code');
        let count = 0;
        sub_dataset.forEach(function(sub_data) {
            let sub_code = sub_data.sub_code;
            if (sub_code.slice(0, -3) === code) {
                count++;
            }
        });
        if (count > 0) {
            $(this).append(`<div class='count'>${count}</div>`);
        }
    })
}

addRowsToTable('#table-group', dataset, true);
addtionalInfo()

