package minecraft

// Big thanks to https://www.reddit.com/r/feedthebeast/comments/5jhuk9/modded_mc_and_memory_usage_a_history_with_a/

func GetVanillaJVMArgs() []string {
	l := []string{}

	// Apparently Intel drivers on laptops with two graphics cards scan the process name for strings
	// like "minecraft" and "javaw.exe" and switch to the dedicated GPU if it sees those names. So they
	// added those to a command-line argument to make sure the drivers can see them in the command line.
	l = append(l, "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump")

	return l
}

func GetModpackJVMArgs() []string {
	l := []string{}

	// LMAO
	l = append(l, "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump")
	// First of all enable experimental VM options
	l = append(l, "-XX:+UnlockExperimentalVMOptions")

	// Turns on G1GC. This is a great garbage collector for interactive applications, such as Minecraft.
	// It tries to keep garbage collection predictable, so it never takes a long time (big lag spikes) and
	// doesn't repeatedly take lots of short times (microstuttering)
	l = append(l, "-XX:+UseG1GC")

	// Sets the heap size to 4G and keeps it pinned at 4G. If you have -Xms
	// set to something smaller, the garbage collector may try to try "harder" to garbage collect to
	// that lower target. This can result in "big lag spikes" because those aggressive collections will be slow and painful.
	l = append(l, "-Xmx4G -Xms4G")

	// Prevents GC every minute.
	l = append(l, "-Dsun.rmi.dgc.server.gcInterval=2147483646")

	// Size of the Permanent Generation. The default value is 64m which is very low.
	l = append(l, "-XX:MaxPermSize=256m")

	// Tells G1GC to put aside 20% of the heap as "new" space. This is space where new objects will be allocated, in general.
	// You want a decent amount, cos MC makes a lot of objects (/me looks at BlockPos) and you don't want to have to run a
	// collection whenever it gets full (this is a big source of microstutters).
	l = append(l, "-XX:G1NewSizePercent=20")

	// This tells G1GC to try and not stop for more than 50 milliseconds when garbage collecting, if possible. This is a target,
	// and G1GC will ignore you if you put a silly number in like 1 which is unattainable. 50 millis is the time for one server
	// tick, and has given me buttery smooth performance on various setups since implementing it.
	l = append(l, "-XX:MaxGCPauseMillis=50")

	// This tells G1GC to allocate it's garbage collection blocks in units of 32megs. The reason for this is that chunk data is
	// typically just over 8megs in size, and if you leave it default (16 megs), it'll treat all the chunk data as "humungous"
	// and so it'll have to be garbage collected specially as a result. Some mods cause humongous allocations as well, such as
	// journeymap, and this setting helps them too.
	l = append(l, "-XX:G1HeapRegionSize=32M")

	return l
}
