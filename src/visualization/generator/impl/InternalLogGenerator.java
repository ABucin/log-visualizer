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

import visualization.dao.InternalLogLineDao;
import visualization.dao.ServerDao;
import visualization.dao.impl.InternalLogLineDaoImpl;
import visualization.dao.impl.ServerDaoImpl;
import visualization.generator.RandomLogGenerator;
import visualization.model.InternalLogLine;
import visualization.model.LogEntrySeverity;
import visualization.model.Server;
import visualization.util.HibernateUtil;

public class InternalLogGenerator extends RandomLogGenerator {

	private List<InternalLogLine> logContents;

	private InternalLogLineDao internalLogLineDao;
	private ServerDao serverDao;
	private HibernateUtil hibernateUtil;

	private List<String> classPool;
	private List<String> messagePool;
	private List<Server> serverPool;

	private static String classPath = "C:/Apache Tomcat/logs/consoleClasses";
	private static String messagePath = "C:/Apache Tomcat/logs/consoleMessages";

	public InternalLogGenerator(String path) {
		try {
			InternalLogGenerator.path = path;
			logFile = new File(path);
			out = new BufferedWriter(new FileWriter(logFile, true));
			hibernateUtil = new HibernateUtil();
			logContents = new LinkedList<InternalLogLine>();
			populateClassPool();
			populateMessagePool();
			internalLogLineDao = new InternalLogLineDaoImpl(
					hibernateUtil.getSessionFactory());
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
//		generateDatabaseContents();
//		internalLogLineDao.batchInsert(logContents);
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
			LogEntrySeverity type = generateRandomMessageType();
			Date timestamp = generateTimestamp();
			String randomClass = (String) generateRandomData(classPool);
			String message = (String) generateRandomData(messagePool);
			Server server = (Server) generateRandomData(serverPool);
			InternalLogLine internalLogLine = new InternalLogLine(timestamp,
					type, randomClass, message, server);
			try {
				out.write(internalLogLine.toString()+"\n");
				out.flush();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	private LogEntrySeverity generateRandomMessageType() {
		Random rand = new Random();
		int len = LogEntrySeverity.values().length;
		int index = rand.nextInt(len);
		return LogEntrySeverity.values()[index];
	}

	private Object generateRandomData(List<?> dataList) {
		Random rand = new Random();
		int size = dataList.size();
		int index = rand.nextInt(size);
		return dataList.get(index);
	}

	private void generateDatabaseContents() {
		for (int i = 0; i < lines; i++) {
			LogEntrySeverity type = generateRandomMessageType();
			Date timestamp = generateTimestamp();
			String randomClass = (String) generateRandomData(classPool);
			String message = (String) generateRandomData(messagePool);
			Server server = (Server) generateRandomData(serverPool);
			InternalLogLine internalLogLine = new InternalLogLine(timestamp,
					type, randomClass, message, server);
			logContents.add(internalLogLine);
		}
	}

	private Date generateTimestamp() {
		return new Date();
	}

	private void populateClassPool() {
		classPool = new LinkedList<String>();
		File f = new File(classPath);
		BufferedReader in = null;
		try {
			in = new BufferedReader(new FileReader(f));
			while (in.ready()) {
				String line = in.readLine();
				classPool.add(line);
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

	private void populateMessagePool() {
		messagePool = new LinkedList<String>();
		File f = new File(messagePath);
		BufferedReader in = null;
		try {
			in = new BufferedReader(new FileReader(f));
			while (in.ready()) {
				String line = in.readLine();
				messagePool.add(line);
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
