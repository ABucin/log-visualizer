package visualization.generator.impl;


import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Random;

import visualization.dao.AccessLogLineDao;
import visualization.dao.ServerDao;
import visualization.dao.impl.AccessLogLineDaoImpl;
import visualization.dao.impl.ServerDaoImpl;
import visualization.generator.RandomLogGenerator;
import visualization.model.AccessLogLine;
import visualization.model.Server;
import visualization.util.HibernateUtil;

public class AccessLogGenerator extends RandomLogGenerator {

	private List<AccessLogLine> logContents;
	private static int ipAddresses = 5;
	
	private List<String> statusCodesPool;
	private List<String> pathsPool;
	private List<String> ipPool;
	private List<Server> serverPool;

	private static String statusCodesPath = "C:/Apache Tomcat/logs/accessStatusCodes";
	private static String accessPathsPath = "C:/Apache Tomcat/logs/accessPaths";

	private AccessLogLineDao accessLogLineDao;
	private ServerDao serverDao;
	private HibernateUtil hibernateUtil;
	
	public AccessLogGenerator(String path) {
		try {
			AccessLogGenerator.path = path;
			logFile = new File(path);
			out = new BufferedWriter(new FileWriter(logFile, true));
			hibernateUtil = new HibernateUtil();
			logContents = new LinkedList<AccessLogLine>();
			populateStatusCodesPool();
			populatePathsPool();
			populateIpPool();
			accessLogLineDao = new AccessLogLineDaoImpl(hibernateUtil.getSessionFactory());
			serverDao = new ServerDaoImpl(hibernateUtil.getSessionFactory());
			serverPool = serverDao.getAllServers();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	public void generateLog() {
		generateFileContents();
		//generateDatabaseContents();
		//accessLogLineDao.batchInsert(logContents);
	}

	@Override
	public void closeLog() {
		try {
			out.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private void generateFileContents() {
		for (int i = 0; i < lines; i++) {
			String ip = (String) generateRandomData(ipPool);
			Date timestamp = generateTimestamp();
			String path = (String) generateRandomData(pathsPool);
			String code = (String) generateRandomData(statusCodesPool);
			long size = generateRandomSize();
			Server server = (Server) generateRandomData(serverPool);
			AccessLogLine accessLogLine = new AccessLogLine(ip, timestamp, path, code, size, server);
			try {
				out.write(accessLogLine.toString()+"\n");
				out.flush();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	
	private void generateDatabaseContents() {
		for (int i = 0; i < lines; i++) {
			String ip = (String) generateRandomData(ipPool);
			Date timestamp = generateTimestamp();
			String path = (String) generateRandomData(pathsPool);
			String code = (String) generateRandomData(statusCodesPool);
			long size = generateRandomSize();
			Server server = (Server) generateRandomData(serverPool);
			AccessLogLine accessLogLine = new AccessLogLine(ip, timestamp, path, code, size, server);
			logContents.add(accessLogLine);
		}
	}
	
	private Object generateRandomData(List<?> dataList) {
		Random rand = new Random();
		int size = dataList.size();
		int index = rand.nextInt(size);
		return dataList.get(index);
	}

	private long generateRandomSize() {
		Random rand = new Random();
		long result = Math.abs((rand.nextLong() + 100) % 3000);
		return result;
	}
	
	private Date generateTimestamp() {
		return new Date();
	}
	
	private void populateIpPool() {
		ipPool = new LinkedList<String>();
		for(int i=0; i<ipAddresses; i++) {
			String ip = "192.168.2."+i;
			ipPool.add(ip);
		}
	}
	
	private void populateStatusCodesPool() {
		statusCodesPool = new LinkedList<String>();
		File f = new File(statusCodesPath);
		BufferedReader in = null;
		try {

			in = new BufferedReader(new FileReader(f));
			while (in.ready()) {
				String line = in.readLine();
				statusCodesPool.add(line);
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			try {
				in.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	
	private void populatePathsPool() {
		pathsPool = new LinkedList<String>();
		File f = new File(accessPathsPath);
		BufferedReader in = null;
		try {
			in = new BufferedReader(new FileReader(f));
			while (in.ready()) {
				String line = in.readLine();
				pathsPool.add(line);
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			try {
				in.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
}
