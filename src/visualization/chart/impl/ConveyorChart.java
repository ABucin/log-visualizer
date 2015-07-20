package visualization.chart.impl;

import java.util.Date;

import visualization.chart.Chart;
import visualization.dao.impl.InternalLogLineDaoImpl;
import visualization.model.LogLine;
import visualization.util.HibernateUtil;

public class ConveyorChart extends Chart {
	public ConveyorChart() {
		super();
		hibernateUtil = new HibernateUtil();
		logLineDao = new InternalLogLineDaoImpl(
				hibernateUtil.getSessionFactory());
	}

	public String getLogLines() {
		StringBuilder buffer = new StringBuilder();
		logLines = logLineDao.getAllLogLines();

		for (LogLine a : logLines) {
			buffer.append(a.toString() + '\n');
		}

		return buffer.toString();
	}

	public String getLogLines(Date date) {
		StringBuilder buffer = new StringBuilder();
		logLines = logLineDao.getAllLogLines(date);

		for (LogLine a : logLines) {
			buffer.append(a.toString() + '\n');
		}

		return buffer.toString();
	}

}
