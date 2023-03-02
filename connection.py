import pymysql



def getConnection():
    '''get connection to db'''
    sql_hostname = 'dbbikes.cjk4ybuxtkwv.us-east-1.rds.amazonaws.com'
    sql_username = 'cmcelduff'
    sql_password = 'Tullamore1!'
    sql_main_database = 'dublin_bikes'
    sql_port = 3306
    connection = pymysql.connect(host=sql_hostname,
                                 user=sql_username,
                                 passwd=sql_password,
                                 db=sql_main_database,
                                 port=sql_port)
    return connection


def connectMysql():
    '''request realtime bike station info from db'''
    connection = getConnection()
    cursor = connection.cursor()

    sql = 'select * from Bike.realtime_data'

    cursor.execute(sql)
    result = cursor.fetchall()
    connection.commit()
    connection.close()
    return result


def getForecast():
    '''request forecast data from db'''
    connection = getConnection()
    cursor = connection.cursor()

    sql = 'select * from Bike.forecast'

    cursor.execute(sql)
    result = cursor.fetchall()
    connection.commit()
    connection.close()
    return result