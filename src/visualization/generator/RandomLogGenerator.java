package visualization.generator;

import java.io.BufferedWriter;
import java.io.File;

public abstract class RandomLogGenerator {

	public static int lines = 2;

	public static String path;

	public File logFile;
	
	public BufferedWriter out;

	public abstract void generateLog();

	public abstract void closeLog();

}
