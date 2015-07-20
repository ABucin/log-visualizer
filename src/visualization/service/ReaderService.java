package visualization.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import visualization.dao.AccessLogLineDao;
import visualization.dao.InternalLogLineDao;
import visualization.dao.ServerDao;
import visualization.dao.impl.AccessLogLineDaoImpl;
import visualization.dao.impl.InternalLogLineDaoImpl;
import visualization.dao.impl.ServerDaoImpl;
import visualization.model.AccessLogLine;
import visualization.model.InternalLogLine;
import visualization.model.LogLine;
import visualization.util.HibernateUtil;

public class ReaderService {

	private HibernateUtil hibernateUtil;
	private File internalLogFile;
	private File accessLogFile;
	private BufferedReader internalReader;
	private BufferedReader accessReader;
	private AccessLogLineDao alld;
	private InternalLogLineDao illd;

	private static int waitTime = 300;

	private boolean isRunning;
	private Date currentDate;

	public ReaderService() {
		hibernateUtil = new HibernateUtil();
		alld = new AccessLogLineDaoImpl(hibernateUtil.getSessionFactory());
		illd = new InternalLogLineDaoImpl(hibernateUtil.getSessionFactory());
	}

	public void startService(String accessPath, String internalPath, Date currentDate) {
		try {
			this.currentDate = currentDate;
			internalLogFile = new File(internalPath);
			accessLogFile = new File(accessPath);
			internalReader = new BufferedReader(new FileReader(internalLogFile));
			accessReader = new BufferedReader(new FileReader(accessLogFile));
			isRunning = true;

			Thread accessThread = new Thread(new AccessReaderThread());
			accessThread.start();
			Thread internalThread = new Thread(new InternalReaderThread());
			internalThread.start();
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public synchronized void stopService() {
		try {
			this.isRunning = false;
			internalReader.close();
			accessReader.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void loadAccessLogFromFile() {
		List<LogLine> buffer = new LinkedList<LogLine>();
		while (this.isRunning == true) {
			try {
				Thread.sleep(waitTime);
				while (buffer.size() != AccessLogLineDao.batchSize) {
					String line = accessReader.readLine();
					AccessLogLine accessLogLine = new AccessLogLine();
					if (line != null) {
						accessLogLine.loadFromString(line);
						if(accessLogLine.getTimestamp().after(currentDate)) {
							buffer.add(accessLogLine);
						}
					}
				}
				alld.batchInsert(buffer);
				buffer = new LinkedList<LogLine>();
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	private void loadInternalLogFromFile() {
		List<LogLine> buffer = new LinkedList<LogLine>();
		while (this.isRunning == true) {
			try {
				Thread.sleep(waitTime);
				while (buffer.size() != InternalLogLineDao.batchSize) {
					String line = internalReader.readLine();
					InternalLogLine internalLogLine = new InternalLogLine();
					if (line != null) {
						internalLogLine.loadFromString(line);
						if(internalLogLine.getTimestamp().after(currentDate)) {
							buffer.add(internalLogLine);
						}
					}
				}
				illd.batchInsert(buffer);
				buffer = new LinkedList<LogLine>();
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	private class AccessReaderThread implements Runnable {

		@Override
		public void run() {
			loadAccessLogFromFile();
		}

	}

	private class InternalReaderThread implements Runnable {

		@Override
		public void run() {
			loadInternalLogFromFile();
		}

	}
}
