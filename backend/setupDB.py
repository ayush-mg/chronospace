import psycopg2
def setupDatabase():
	dbConn=psycopg2.connect(dbname="postgres",user="postgres",password="prashnmark",host="localhost",port="5432")
	dbConn.autocommit=True
	cursorObj=dbConn.cursor()
	cursorObj.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
	cursorObj.execute("CREATE TABLE IF NOT EXISTS historicalBoundaries(id SERIAL PRIMARY KEY,regionName VARCHAR(255),startYear INT,endYear INT,geom GEOMETRY(MultiPolygon,4326));")
	cursorObj.close()
	dbConn.close()
setupDatabase()