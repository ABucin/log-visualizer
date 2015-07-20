package visualization.chart.impl;

import java.util.LinkedList;
import java.util.List;

import visualization.chart.Chart;
import visualization.dao.impl.AccessLogLineDaoImpl;
import visualization.model.AccessLogLine;


public class BarChart extends Chart {

	public BarChart() {
		super();
		logLineDao = new AccessLogLineDaoImpl(hibernateUtil.getSessionFactory());
		logLines = new LinkedList<AccessLogLine>();
	}

	public String getStatusCodeOccurences() {
		List<?> data = ((AccessLogLineDaoImpl)logLineDao).getBarChartData();
		StringBuilder buffer = new StringBuilder();
		
		for(Object o:data) {
			Object[] arr = ((Object[]) o);
			buffer.append(arr[1]+","+arr[0]+","+arr[2]+'\n');
		}

		return buffer.toString();
	}

}
