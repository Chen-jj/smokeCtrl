
function initComplexArea(a, k, h, p, q, d, b, l) {
    var f = initComplexArea.arguments;
    var m = document.getElementById(a);
    var o = document.getElementById(k);
    var n = document.getElementById(h);
    var e = 0;
    var c = 0;
    if (p != undefined) {
        if (d != undefined) {
            d = parseInt(d);
        }
        else {
            d = 0;
        }
        if (b != undefined) {
            b = parseInt(b);
        }
        else {
            b = 0;
        }
        if (l != undefined) {
            l = parseInt(l);
        }
        else {
            l = 0
        }
        n[0] = new Option("请选择 ", 0);
        var pLen = p.length;
        for (e = 0; e < pLen; e++) {
            if (p[e] == undefined) {
                continue;
            }
            if (f[6]) {
                if (f[6] == true) {
                    if (e == 0) {
                        continue
                    }
                }
            }
            m[c] = new Option(p[e], e);
            if (d == e) {
                m[c].selected = true;
            }
            c++
        }
        if (q[d] != undefined) {
            c = 0; for (e = 0; e < q[d].length; e++) {
                if (q[d][e] == undefined) { continue }
                if (f[6]) {
                    if ((f[6] == true) && (d != 71) && (d != 81) && (d != 82)) {
                        if ((e % 100) == 0) { continue }
                    }
                } o[c] = new Option(q[d][e], e);
                if (b == e) { o[c].selected = true } c++
            }
        }
    }
}

function changeComplexProvince(f, k, e, d) {
    var c = changeComplexProvince.arguments; var h = document.getElementById(e);
    var g = document.getElementById(d); var b = 0; var a = 0; removeOptions(h); f = parseInt(f);

    if (k[f] != undefined) {
        for (b = 0; b < k[f].length; b++) {
            if (k[f][b] == undefined) { continue }
            if (c[3]) { if ((c[3] == true) && (f != 71) && (f != 81) && (f != 82)) { if ((b % 100) == 0) { continue } } }
            h[a] = new Option(k[f][b], b); a++
        }
    }

    removeOptions(g);
    g[0] = new Option("请选择 ", 0);

    if (f == 11 || f == 12 || f == 31 || f == 71 || f == 50 || f == 81 || f == 82) {
        if ($("#seachdistrictSelect")) { 
            $("#seachdistrictSelect").hide(); 
        }
    }
    else {
        if ($("#seachdistrictSelect")) {
            $("#seachdistrictSelect").show();
        }
    }

    $("#citySpan").text("请选择");
    $("#areaSpan").text("请选择");
    $("#provSpan").text(area_array[f]);
}

 
function changeCity(c, a, t) {
    $("#" + a).html('<option value="0" >请选择</option>');
    $("#" + a).unbind("change");
    c = parseInt(c); 
    var _d = sub_arr[c];

    if (_d) {
        var str = "";     
        str += "<option value='0' >请选择</option>";
        for (var i = c * 100; i < _d.length; i++) {
            if (_d[i] == undefined)
                continue; 
            str += "<option value='" + i + "' >" + _d[i] + "</option>";
        }
        $("#" + a).html(str);
    }

    var prov = Div(c, 100);
    if (_d) {
        console.log("非直辖市：")
        console.log(sub_array[prov][c]);
        $("#citySpan").text(sub_array[prov][c]);
    } else if (c == 0) {
        $("#citySpan").text("请选择");
    } else {
        console.log("直辖市：");
        console.log(sub_array[prov][c]);
        $("#citySpan").text(sub_array[prov][c]);
    }
}

function changeArea(val) {
    var city = Div(val, 100);
    if (val == 0)
        $("#areaSpan").text("请选择");
    else
        $("#areaSpan").text(sub_arr[city][val]);
}

function removeOptions(c) {
    if ((c != undefined) && (c.options != undefined)) {
        var a = c.options.length;
        for (var b = 0; b < a; b++) {
            c.options[0] = null;
        }
    }
}

//整除
function Div(exp1, exp2)
{
    var n1 = Math.round(exp1); //四舍五入
    var n2 = Math.round(exp2); //四舍五入
    
    var rslt = n1 / n2; //除
    
    if (rslt >= 0)
    {
        rslt = Math.floor(rslt); //返回值为小于等于其数值参数的最大整数值。
    }
    else
    {
        rslt = Math.ceil(rslt); //返回值为大于等于其数字参数的最小整数。
    }
    
    return rslt;
}