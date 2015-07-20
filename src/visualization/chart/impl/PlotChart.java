package visualization.chart.impl;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import visualization.chart.Chart;
import visualization.dao.impl.AccessLogLineDaoImpl;
import visualization.model.AccessLogLine;


public class PlotChart extends Chart {

	public PlotChart() {
		super();
		logLineDao = new AccessLogLineDaoImpl(hibernateUtil.getSessionFactory());
		logLines = new LinkedList<AccessLogLine>();
	}

	public String getPageOccurences() {
		List<?> data = ((AccessLogLineDaoImpl) logLineDao).getPlotChartData();
		StringBuilder buffer = new StringBuilder();

		for (Object o : data) {
			Object[] arr = ((Object[]) o);
			String tempDate = dateFormat.format(arr[1]);
			String newDate = tempDate.replaceFirst("EEST ", "");
			buffer.append(newDate + "," + arr[2] + "," + arr[0] + '\n');
		}

		return buffer.toString();
	}
	
	public String getPageOccurences(Date date) {
		List<?> data = ((AccessLogLineDaoImpl) logLineDao).getPlotChartData(date);
		StringBuilder buffer = new StringBuilder();

		for (Object o : data) {
			Object[] arr = ((Object[]) o);
			String tempDate = dateFormat.format(arr[1]);
			String newDate = tempDate.replaceFirst("EEST ", "");
			buffer.append(newDate + "," + arr[2] + "," + arr[0] + '\n');
		}

		return buffer.toString();
	}
}
