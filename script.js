
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



// 연결선 만들기 함수 정의
function dr(sourceObj, target, direction, page) {
    
    let page_target = $('#table-group div')
    let line_zindex = 10;
    let popup_line = '';
    if (page == 'popup') {
        page_target = $('.modal-content div')
        line_zindex = 5001;
        popup_line = ' popup_line';
    }
    const targetObj = page_target.filter(function() { return $(this).attr('cell_code') === target; })
    const obj1 = sourceObj.get(0);
    const obj2 = targetObj.get(0);
    if (!obj1 || !obj2) {
        return;
    }
    targetObj.addClass('selected s_' +direction)
    sourceObj.addClass('findRelated')

    let code_source = sourceObj.attr('cell_code');
    let code_target = targetObj.attr('cell_code');

    let lineColor
    if (direction == 'pre') {lineColor = '#b452d2';}
        else if (direction == 'follow') {lineColor = '#778ae2';}
        else {lineColor = '#000000';}
    const lineSvg = $('<svg class="line-svg' + popup_line +'" cell_code=' + code_source + ',' + code_target+ '></svg>').attr('width', $(document).width()).attr('height', $(document).height()).css('z-index', line_zindex)[0];
    $('body').append(lineSvg);
    
    const rect1 = obj1.getBoundingClientRect();
    const rect2 = obj2.getBoundingClientRect();

    const isALeftOfB = rect1.left < rect2.left;
    const isARightOfB = rect1.left > rect2.left;
    const isASameB = rect1.left = rect2.left;


    let x1 = rect1.left + rect1.width + window.scrollX;
    let y1 = rect1.top + rect1.height / 2 + window.scrollY;
    let x2 = rect2.left + window.scrollX;
    let y2 = rect2.top + rect2.height / 2 + window.scrollY;
    
    if (isARightOfB) {
        x1 = rect1.left + window.scrollX;
        x2 = rect2.left + rect2.width + window.scrollX;
    } else if (rect1.left === rect2.left) {
        x1 = rect1.right + window.scrollX;
        x2 = rect2.right + window.scrollX;
    }

    let curve = Math.abs(x1 - x2) / 2;
    if (curve == 0) {curve = 80;}
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    if (rect1.left < rect2.left) {
        path.setAttribute('d', `M${x1},${y1} C${x1 + curve},${y1} ${x2 - curve},${y2} ${x2},${y2}`);
    } else if (rect1.left > rect2.left) {
        path.setAttribute('d', `M${x1},${y1} C${x1 - curve},${y1} ${x2 + curve},${y2} ${x2},${y2}`);
    } else {
            path.setAttribute('d', `M${x1},${y1} C${x1 + curve},${y1} ${x2 + curve},${y2} ${x2},${y2}`);

    }
    path.setAttribute('stroke', lineColor);
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('fill', 'none');

    lineSvg.appendChild(path);

    // Add arrowhead to the end of the line
    const arrowhead = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    if (direction == 'pre') {
        if (isARightOfB) {
            arrowhead.setAttribute('d', `M${x1},${y1} L${x1 - 10},${y1 - 5} L${x1 - 10},${y1 + 5} Z`);
        } else {
            arrowhead.setAttribute('d', `M${x1},${y1} L${x1 + 10},${y1 - 5} L${x1 + 10},${y1 + 5} Z`);
        }
    } else if (direction == 'follow') {
        if (isARightOfB) {
            arrowhead.setAttribute('d', `M${x2},${y2} L${x2 + 10},${y2 - 5} L${x2 + 10},${y2 + 5} Z`);
        }
        else if (isALeftOfB) {
            arrowhead.setAttribute('d', `M${x2},${y2} L${x2 - 10},${y2 - 5} L${x2 - 10},${y2 + 5} Z`);
        } 
        else if (isASameB) {
            arrowhead.setAttribute('d', `M${x2},${y2} L${x2 + 10},${y2 - 5} L${x2 + 10},${y2 + 5} Z`);
        }
    }
    arrowhead.setAttribute('fill', lineColor);
    lineSvg.appendChild(arrowhead);

    // 각 단계에 마우스 호버했을 때, 연결된 단계만 연결선 강조하기
    $('.findRelated, .selected').hover(function() {
        const cellCode = $(this).attr('cell_code');
        $('.line-svg').css('opacity', '0.2');
        $('.line-svg').each(function() {
            const svgCellCodes = $(this).attr('cell_code').split(',');
            if (svgCellCodes.includes(cellCode)) {
                $(this).css('opacity', '1');
            }
        });
    }, function() {
        $('.line-svg').css('opacity', '');
    });
}



// 기능 버튼 액션 정의
$('.subject').click(function() { 
    const subject = $(this).attr('subject');
    $('.line-svg').remove();

    $('#table-group').empty();
    if (subject === 'math') {
        subject_name = "math"
        dataset = dataset_math;
    } else if (subject === 'english') {
        subject_name = "english"
        dataset = dataset_english;
    } else if (subject === 'information') {
        subject_name = "information"
        dataset = dataset_information;
    }
    addRowsToTable('#table-group', dataset, true);
    addtionalInfo()
});

$('#reverse-button').click(function() {
    $('#reset-button').click();
    $('#table-group').empty();
    addRowsToTable('#table-group', dataset, true);
});
$('#minimum-button').click(function() {
    $('.cell_number').toggle();
    $('.cell_info').toggle();
    $('.cell').toggleClass('small');
    $('.cell_name').toggleClass('small');
    let tableWidth
    if ($('html').css('--table_width') == '220px') {
        tableWidth = '140px';
    } else {
        tableWidth = '220px';
    }
    $('html').css('--table_width', tableWidth);
    $('.cell_number').each(function() {
        const parent = $(this).parent();
        if (parent.css('background-color') === $(this).css('background-color')) {
            parent.css('background-color', '');
        } else {
            parent.css('background-color', $(this).css('background-color'));
        }
        
    });
});
$('#minimum-width-button').click(function() {
    $('.cell_number').toggle();
    $('.cell_info_left').toggle();
    $('.cell_name').toggleClass('small');
    $('.cell_info_right').toggleClass('small');
    let tableWidth
    if ($('html').css('--table_width') == '220px') {
        tableWidth = '140px';
    } else {
        tableWidth = '220px';
    }
    $('html').css('--table_width', tableWidth);
});
$('#reset-button').click(function() {
    $('.line-svg').remove();
    $('.findRelated, .selected, .s_pre, .s_follow').removeClass('findRelated selected s_pre s_follow');
})

// 단축키 정의
$(document).on('keydown', function(event) {
    $(document).on('keydown', function(event) {
        if (event.key === 'q' || event.key === 'ㅂ') {
            $('#reverse-button').click();
        }
    });
});

$(document).on('keydown', function(event) {
    if (event.key === 'e' || event.key === 'ㄷ') {
        $('#minimum-button').click();
    }
});
$(document).on('keydown', function(event) {
    if (event.key === 'r' || event.key === 'ㄱ') {
        $('#reset-button').click();
    }
});
$(document).on('keydown', function(event) {
    if (event.key === 'c' || event.key === 'ㅊ' || event.key === 'Escape') {
        $('.modal-close').click();
    }
});


// 연결 선 그리기 액션 정의
function drawRelated(a,page) {
    const cell = a.closest('.cell');
    const target = a.attr('relatedcode');
    const direction = a.attr('direction');
    dr(cell, target, direction,page);
}

// 선후학습 개별 클릭 시 액션 제어
$(document).on('click', '.popup_bullet', function(event) {
    event.stopPropagation();

    if ($(this).parents('.modal-content').length === 0) {
        const target = $(this).attr('relatedcode');
        const targetDiv = $(`div[cell_code="${target}"]`);
        const targetDirection = $(this).attr('direction');
        if (event.metaKey || event.ctrlKey) {
            targetDiv.find(`.popup_bullet[direction="${targetDirection}"]`).click();
        } 
        const targetOffset = targetDiv.offset().left;
        const targetWidth = targetDiv.outerWidth();
        const targetHeight = targetDiv.outerHeight();
        const targetCenterX = targetOffset + (targetWidth / 2);
        const targetCenterY = targetDiv.offset().top + (targetHeight / 2);
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();
        const scrollPositionX = targetCenterX - (windowWidth / 2);
        const scrollPositionY = targetCenterY - (windowHeight / 2);
        $('html, body').animate({
            scrollLeft: scrollPositionX,
            scrollTop: scrollPositionY
        }, 500);
        
        drawRelated($(this));
    }
})


// 전체 연결 액션 정의
$(document).on('click', '.connect_all', function(event) {
    event.stopPropagation();
    $(this).parent().find('.popup_bullet').each(function() {
        drawRelated($(this));
    })
})

// 전체 연결 액션 정의
$(document).on('click', '.lv .all', function() {
    $(this).parent().parent().siblings().find('.popup_bullet').each(function() {
        drawRelated($(this));
    })
})


// 팝업 만들기
$(document).on('click', '.cell', function() {
    if ($(this).parents('.modal-content').length === 0) {
        showModal($(this).prop('outerHTML'))
    }
})

function showModal(sourceObj){
    let modal = `
        <div class="modal">
            <div class="modal-content">
                <div class="center">${sourceObj}</div>
            </div>
        </div>
        <div class="modal-close"></div>
    `;

    
    $('body').css('overflow', 'hidden');
    $('body').append(modal);    

    function makeRelated_inPopup(a, dd) {

        let left = $('<div class="left"></div>');
        let right = $('<div class="right"></div>');

        a.find('.popup_bullet').each(function() {
            let code = $(this).attr('relatedcode');
            let direction = $(this).attr('direction');
            let target = $(`#table-group [cell_code="${code}"]`).clone();
            if ($(`.modal [cell_code="${code}"]`).length > 0) {
                return;
            }

            if (direction === 'pre' && (dd === 'pre' || dd === 'all')) {
                a.parent().before(left);
                left.append(target);
                makeRelated_inPopup(target, 'pre');
            } else if (direction === 'follow' && (dd === 'follow' || dd === 'all')) {
                a.parent().after(right);
                right.append(target);
                makeRelated_inPopup(target, 'follow');
            }
        });
    };

    makeRelated_inPopup($('.modal .cell'), 'all');
    
    $('.modal .cell').each(function() {
        const code = $(this).attr('cell_code');
        $(this).append(`<span class="level">${findLvName(code).lv1} > ${findLvName(code).lv2}</span>`);
    })
    

    let main_cell = $('.modal .center .cell')
    let main_cell_code = main_cell.attr('cell_code');

    let sub_match = true
    sub_dataset.forEach(function(sub_data) {
        let sub_code = sub_data.sub_code;
        if (sub_code.slice(0, -3) === main_cell_code) {
            // let sub_cell = $(`<div class="sub_cell" sub_cell_code="${sub_code}"><span class='code'>${sub_code.slice(0, -3)}<span class='code_c'>${sub_code.slice(-3)}</span></span><span class='desc'>${sub_data.desc.replace(/[.,]/g, '<span>/</span>')}</span></div>`);
            let sub_cell = $(`<div class="sub_cell" sub_cell_code="${sub_code}"><span class='code'>${sub_code.slice(0, -3)}<span class='code_c'>${sub_code.slice(-3)}</span></span><span class='desc'>${sub_data.desc}</span></div>`);
            if (sub_match) {
                main_cell.parent().append(`<div class='match'>소주제</div>`);
                sub_match = false
            }
            main_cell.parent().append(sub_cell);
            
        }
    });

    $('.modal .cell').find('.popup_bullet').each(function() {
        drawRelated($(this), 'popup'); 
    })
    
    $('.modal-close').click(function() {
        $('.modal').remove();
        $('.modal-close').remove();
        $('body').css('overflow', 'auto');
        $('.line-svg.popup_line').remove();
    });


    // $('.modal-content').append()

}
