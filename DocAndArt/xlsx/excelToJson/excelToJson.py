# -*- coding:utf-8 -*-
# @Date    : 2016-07-13 14:47:56
# @Function: 把Excel表单转化为json文件
# @Author  : JennyZhang
import  xdrlib ,sys,os
import xlrd
import json
import codecs
import os
import sys

def is_float(s):
    s = str(s)
    if s.count('.') == 1: #小数有且仅有一个小数点
        left = s.split('.')[0]  #小数点左边（整数位，可为正或负）
        right = s.split('.')[1]  #小数点右边（小数位，一定为正）
        lright = '' #取整数位的绝对值（排除掉负号）
        if s.count('-') == 1 and s[0] == '-': #如果整数位为负，则第一个元素一定是负号
            lright = left.split('-')[1]
        elif s.count('-') == 0:
            lright = left
        else:
            return False
        if right.isdigit() and lright.isdigit(): #判断整数位的绝对值和小数位是否全部为数字
            return True
        else:
            return False
    else:
        return False

#
def Sheet2Json(book,idx):
    sheet = book.sheet_by_index(idx)
    worksheets = book.sheet_names()
    if sheet.nrows == 0 :
        print("空的表单")
        return
    row_0 = sheet.row(0)  # 第一行是表单标题
    nrows = sheet.nrows  # 行号
    ncols = sheet.ncols  # 列号

    result = {}  # 定义json对象
    result["title"] = file_path  # 表单标题
    result["rows"] = nrows  # 行号
    result["children"] = []  # 每一行作为数组的一项
    # 遍历所有行，将excel转化为json对象
    for i in range(nrows):
        if i == 0:
            continue
        tmp = {}
        # 遍历当前行所有列
        for j in range(ncols):
            # 获取当前列中文标题
            title_de = str(row_0[j])
            title_cn = title_de.split("'")[1]
            # 获取单元格的值
            if title_cn != "" :
                sheetValue = sheet.row_values(i)[j]
                if is_float(sheetValue) :
                    tmp[title_cn] = int(sheetValue)
                else :
                    tmp[title_cn] = sheetValue            
        result["children"].append(tmp)
    json_data = json.dumps(result, indent=4,ensure_ascii=False)

    saveFile(os.getcwd(), worksheets[idx], json_data)
    #print(json_data)
#
def Excel2Json(file_path):
    # 打开excel文件
    if get_data(file_path) is not None:
        book = get_data(file_path)
        worksheets = book.sheet_names()
        # 抓取所有sheet页的名称

        print("该Excel包含的表单列表为:")
        for sheet in worksheets:
            print('%s,%s' % (worksheets.index(sheet), sheet))
            idx = worksheets.index(sheet)
            Sheet2Json(book , int(idx))



# 获取excel数据源
def get_data(file_path):
    """获取excel数据源"""
    try:
        data = xlrd.open_workbook(file_path)
        return data
    except Exception as e:
        print(u'excel表格读取失败：%s' % e)
        return None


def saveFile(file_path, file_name, data):
    output = codecs.open(file_path + "/" + file_name + ".json", 'w', "utf-8")
    output.write(data)
    output.close()


if __name__ == '__main__':
    #file_path = input(u'请输入excel文件路径：\n')
    if len(sys.argv) < 2:
        print('Usage: %s <excel_file>' % sys.argv[0])
        sys.exit(1)

    print("\nhandle file: %s" % sys.argv[1])
    file_path = sys.argv[1]
    json_data = Excel2Json(file_path)
