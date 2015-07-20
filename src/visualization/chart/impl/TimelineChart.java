package visualization.chart.impl;

import java.util.Date;
import java.util.List;


import visualization.chart.Chart;
import visualization.dao.impl.AccessLogLineDaoImpl;
import visualization.model.LogLine;
import visualization.util.HibernateUtil;

public class TimelineChart extends Chart{

	public TimelineChart() {
		super();
		hibernateUtil = new HibernateUtil();
		logLineDao = new AccessLogLineDaoImpl(hibernateUtil.getSessionFactory());
	}

	public String getLogLines(Date date) {

		List<? extends LogLine> data = ((AccessLogLineDaoImpl)logLineDao).getAllLogLines(date);
		StringBuilder buffer = new StringBuilder();

		for (LogLine a : data) {
			buffer.append(a.toString() + '\n');
		}

		return buffer.toString();
	}
	
	public String getLogLines(Date start, Date end) {

		List<? extends LogLine> data = ((AccessLogLineDaoImpl)logLineDao).getLogLinesRange(start, end);
		StringBuilder buffer = new StringBuilder();

		for (LogLine a : data) {
			buffer.append(a.toString() + '\n');
		}

		return buffer.toString();
	}
}
