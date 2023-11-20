

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

