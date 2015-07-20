package visualization.chart.impl;

import java.util.LinkedList;
import java.util.List;

import visualization.chart.Chart;
import visualization.dao.impl.AccessLogLineDaoImpl;
import visualization.model.AccessLogLine;


public class TreeChart extends Chart {

	public TreeChart() {
		super();
		logLineDao = new AccessLogLineDaoImpl(hibernateUtil.getSessionFactory());
		logLines = new LinkedList<AccessLogLine>();
	}
	
	public String getLogLines() {
		List<?> data = ((AccessLogLineDaoImpl)logLineDao).getTreeChartData();
		StringBuilder buffer = new StringBuilder();
		
		for(Object o:data) {
			Object[] arr = ((Object[]) o);
			String tempPath = ((String) arr[1]);
			String token = null;
			if(tempPath.indexOf("?") > 0) {
				token = "?";
			} else {
				token = "HTTP";
			}
			String processedTempPath = tempPath.substring(tempPath.indexOf("/"), tempPath.indexOf(token) - 1);
			buffer.append(processedTempPath+","+arr[0]+'\n');
		}

		return buffer.toString();
	}
}
