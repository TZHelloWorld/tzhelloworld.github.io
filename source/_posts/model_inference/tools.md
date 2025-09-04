---
title: GPU性能分析工具
excerpt: '工欲善其事，必先利其器。对于性能分析也一样，Nsys/NCU/nvidia-smi/profile工具的使用'
index_img: /img/post/
category_bar:
  - ''
categories:
  - null
tags:
  - null
date: 2025-09-03 00:05:22
updated:
sticky:
---
{% note success %}
这个主要是对训练/推理过程中，可视化`GPU`性能的分析工具使用说明，注意在容器中需要权限去访问底层硬件，所以一般需要提供 `CAP_SYS_ADMIN/SYS_ADMIN` 权限，或者说`--privileged`权限。
{% endnote %}


# NVML & DCGM

`NVIDIA GPU` 上存在一些**硬件计数器**，这些计数器可以用来收集一些**设备级别** (硬件采集支持) 的性能指标，例如 `GPU` 利用率、显存使用情况等。通过 `NVIDIA`提供的`NVML`（`NVIDIA Management Library`）库或 `DCGM`（`Data Center GPU Manager`）工具能够查询和采集硬件层提供的这些指标。

- [NVML](https://developer.nvidia.com/management-library-nvml)：这是一个基于 `C` 的编程接口，用于监控和管理数据中心 `GPU` 中的各种状态。这也是 `NVIDIA` 支持 `nvidia-smi` 工具的底层库，`nvidia-smi`命令会随着驱动的安装而存在。`NVML` 是线程安全的，因此可以多个线程同时对 `NVML` 进行调用。
- [DCGM](https://developer.nvidia.com/dcgm)：`DCGM`是一套用于在集群环境中管理和监控数据中心的 `NVIDIA GPU` 工具，旨在管理和轻松监控数据中心 `GPU` 资源的运行状况、性能和利用率。
  - 使用：首先在有 `NVIDIA GPU` 服务器的节点上安装 `DCGM`(核心是 `libdcgm.so` 库)，然后可通过 `HostEngine` 启动服务或将`HostEngine`作为嵌入式进程启动（`DCGM Exporter`容器中）。服务启动后，`DCGM` 提供两种用户交互的界面：`dcgmi`(命令行交互) 和 `DCGM Exporter`（为原生 `Kubernetes` 环境中的集群级监控定制）。
  - 根据[How to get the module profile loaded? · Issue #132 · NVIDIA/DCGM](https://github.com/NVIDIA/DCGM/issues/132)提示：性能分析模块`DCGM` 中的 `Profiling` 模块对 `RTX/GTX GPU` 类卡并不支持，即在消费级显卡 `RTX 4090` 上一些指标数据无法通过 `DCGM Exporter`采集到（如 `sm issue` 通过 `DCGM Exporter` 无法采集到）。

## nvidia-smi

所有的使用可通过 `nvidia-smi -h` 查看帮助：
```bash
命令	功能说明	输出内容

# 基础信息查询命令

nvidia-smi	显示GPU总览信息	GPU列表、温度、功耗、内存使用
nvidia-smi -L	列出所有GPU设备	GPU UUID和名称列表
nvidia-smi -h	显示帮助信息	所有可用命令选项
nvidia-smi -i 0	查询指定GPU信息	单个GPU详细状态
nvidia-smi -q	查询详细GPU信息	完整GPU配置和状态


# 实时监控命令
nvidia-smi -l 1	每秒循环显示信息	-l [秒数]：循环间隔
nvidia-smi dmon	设备监控模式	简洁格式实时数据
nvidia-smi dmon -s pucvmet	指定监控指标	p:功耗 u:利用率 c:时钟 v:温度 m:内存 e:编码器 t:时间
nvidia-smi dmon -c 100	限制监控次数	-c [次数]：监控100次后退出
nvidia-smi dmon -s p -c 60 -d	带日期的功耗监控	-d：添加日期前缀

# 详细查询命令
nvidia-smi -q -d MEMORY	查询内存详细信息	内存使用、BAR1、ECC状态
nvidia-smi -q -d PERFORMANCE	查询性能状态	P-State、时钟频率、性能模式
nvidia-smi -q -d SUPPORTED_CLOCKS	查询支持的时钟频率	所有可用时钟设置
nvidia-smi -q -d POWER	查询功耗详细信息	功耗限制、当前功耗、电压
nvidia-smi -q -d CLOCK	查询当前时钟信息	GPU、内存、视频时钟频率

# 拓扑和连接命令
nvidia-smi topo -m	显示GPU拓扑矩阵	GPU间连接关系和NUMA亲和性
nvidia-smi topo -p	显示PCIe拓扑	仅PCIe连接（排除NVLink）
nvidia-smi nvlink --status	NVLink状态查询	NVLink连接状态和错误
nvidia-smi nvlink -i 0 --status	指定GPU的NVLink状态	单GPU所有NVLink状态
nvidia-smi nvlink -i 0 -l 0 --status	指定NVLink通道状态	特定通道详细状态

# 进程和应用监控命令

nvidia-smi pmon	进程监控模式	各进程GPU使用情况	多进程GPU资源分析
nvidia-smi pmon -c 50	限制进程监控次数	监控50次进程状态	定期进程检查
nvidia-smi --query-compute-apps=pid,process_name,gpu_uuid,gpu_name,used_memory --format=csv	查询计算应用详情	CSV格式的应用信息	自动化脚本和报告
nvidia-smi --query-accounted-apps=pid,gpu_util,mem_util,max_memory_usage,time --format=csv	查询应用账户信息	应用资源使用统计	资源使用审计


# 自定义查询命令
nvidia-smi --query-gpu=gpu_name,driver_version,memory.total,memory.used --format=csv	自定义GPU信息查询	CSV格式输出	自动化监控和报表
nvidia-smi --query-gpu=temperature.gpu,power.draw,utilization.gpu,utilization.memory --format=csv,noheader,nounits	纯数值输出	无表头无单位的数值	数据采集和处理
nvidia-smi --query-gpu=clocks.current.graphics,clocks.current.sm,clocks.current.memory,clocks.current.video --format=csv	时钟频率查询	各种时钟频率信息	性能状态监控
nvidia-smi --query-gpu=ecc.errors.corrected.total,ecc.errors.uncorrected.total --format=csv	ECC错误查询	内存错误统计	硬件可靠性监控

```

监控脚本
```bash
#!/bin/bash# 企业级GPU监控脚本# 功能：全面监控、日志记录、告警通知
LOG_DIR="/var/log/gpu-monitoring"
ALERT_TEMP=85
ALERT_POWER=300
ALERT_MEMORY=90

mkdir -p $LOG_DIR# 综合监控函数monitor_gpu() {local gpu_id=$1local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    # 获取详细GPU信息local gpu_info=$(nvidia-smi -i $gpu_id --query-gpu=\
name,temperature.gpu,power.draw,utilization.gpu,utilization.memory,\
memory.used,memory.total,clocks.current.graphics,clocks.current.memory,\
fan.speed,pstate,clocks.throttle_reasons.active \
--format=csv,noheader,nounits)
    # 记录到日志echo "$timestamp,GPU$gpu_id,$gpu_info" >> "$LOG_DIR/gpu_${gpu_id}_detailed.log"# 解析并检查告警条件
    IFS=',' read -ra VALUES <<< "$gpu_info"local temp=${VALUES[1]}local power=${VALUES[2]}local mem_used=${VALUES[5]}local mem_total=${VALUES[6]}local throttle=${VALUES[11]}# 计算内存使用率if [[ $mem_used != "[Not Supported]" && $mem_total != "[Not Supported]" ]]; thenlocal mem_percent=$((mem_used * 100 / mem_total))
        # 内存告警if [[ $mem_percent -gt $ALERT_MEMORY ]]; thenecho "ALERT: GPU$gpu_id Memory usage ${mem_percent}% exceeds threshold" | \tee -a "$LOG_DIR/alerts.log"fifi# 温度告警if [[ $temp != "[Not Supported]" && $temp -gt $ALERT_TEMP ]]; thenecho "ALERT: GPU$gpu_id Temperature ${temp}°C exceeds threshold" | \tee -a "$LOG_DIR/alerts.log"fi# 功耗告警if [[ $power != "[Not Supported]" && ${power%.*} -gt $ALERT_POWER ]]; thenecho "ALERT: GPU$gpu_id Power ${power}W exceeds threshold" | \tee -a "$LOG_DIR/alerts.log"fi# 节流告警if [[ $throttle == "Active" ]]; thenecho "ALERT: GPU$gpu_id Throttling active" | \tee -a "$LOG_DIR/alerts.log"fi
}

# 系统拓扑分析analyze_topology() {echo "=== GPU拓扑分析 ===" > "$LOG_DIR/topology_report.txt"
    nvidia-smi topo -m >> "$LOG_DIR/topology_report.txt"echo -e "\n=== NVLink状态 ===" >> "$LOG_DIR/topology_report.txt"
    nvidia-smi nvlink --status >> "$LOG_DIR/topology_report.txt"echo -e "\n=== PCIe信息 ===" >> "$LOG_DIR/topology_report.txt"
    nvidia-smi --query-gpu=pci.bus_id,pci.domain,pci.bus,pci.device_id,pci.sub_device_id \
    --format=csv >> "$LOG_DIR/topology_report.txt"
}

# 性能基准报告performance_baseline() {local output_file="$LOG_DIR/performance_baseline_$(date +%Y%m%d_%H%M%S).txt"echo "=== GPU性能基准报告 ===" > "$output_file"echo "测试时间: $(date)" >> "$output_file"# 支持的时钟频率echo -e "\n=== 支持的时钟频率 ===" >> "$output_file"
    nvidia-smi -q -d SUPPORTED_CLOCKS >> "$output_file"# 当前性能状态echo -e "\n=== 当前性能状态 ===" >> "$output_file"
    nvidia-smi -q -d PERFORMANCE >> "$output_file"# ECC状态echo -e "\n=== ECC状态 ===" >> "$output_file"
    nvidia-smi -q -d ECC >> "$output_file"# 详细配置echo -e "\n=== 详细GPU配置 ===" >> "$output_file"
    nvidia-smi -q >> "$output_file"
}

# 主监控循环main() {echo "开始GPU监控 - $(date)"# 获取GPU数量local gpu_count=$(nvidia-smi -L | wc -l)
    # 生成系统报告（首次运行）if [[ ! -f "$LOG_DIR/topology_report.txt" ]]; then
        analyze_topology
        performance_baselinefi# 持续监控while true; dofor ((i=0; i<gpu_count; i++)); do
            monitor_gpu $idonesleep 60  # 每分钟采集一次done
}

# 脚本参数处理case "$1" in"monitor")
        main
        ;;"topology")
        analyze_topology
        ;;"baseline")
        performance_baseline
        ;;"alert-test")# 测试告警功能
        ALERT_TEMP=0 ALERT_POWER=0 ALERT_MEMORY=0
        monitor_gpu 0
        ;;
    *)echo "用法: $0 {monitor|topology|baseline|alert-test}"echo "  monitor    - 开始持续监控"echo "  topology   - 生成拓扑报告"echo "  baseline   - 生成性能基准报告"echo "  alert-test - 测试告警功能"exit 1
        ;;
esac
```
```bash
# 1. GPU健康检查脚本#!/bin/bash# gpu_health_check.shcheck_gpu_health() {echo "=== GPU健康检查报告 ==="echo "检查时间: $(date)"# ECC错误检查echo -e "\n1. ECC错误统计:"
    nvidia-smi --query-gpu=index,ecc.errors.corrected.total,ecc.errors.uncorrected.total \
    --format=csv
    # 温度状态echo -e "\n2. 温度状态:"
    nvidia-smi --query-gpu=index,temperature.gpu,temperature.memory,fan.speed \
    --format=csv
    # 节流状态echo -e "\n3. 节流状态检查:"
    nvidia-smi --query-gpu=index,clocks.throttle_reasons.active,clocks.throttle_reasons.hw_thermal_slowdown \
    --format=csv
    # 功耗状态echo -e "\n4. 功耗状态:"
    nvidia-smi --query-gpu=index,power.draw,power.limit,power.default_limit \
    --format=csv
    # 进程占用echo -e "\n5. 进程占用情况:"
    nvidia-smi pmon -c 1
}

# 2. 多GPU训练监控脚本
#!/bin/bash
# multi_gpu_training_monitor.shmonitor_training() {local log_file="training_monitor_$(date +%Y%m%d_%H%M%S).csv"local duration=${1:-3600}  # 默认监控1小时local interval=${2:-5}     # 默认5秒间隔echo "timestamp,gpu_id,util_gpu,util_mem,temp,power,mem_used,mem_total,sm_clock,mem_clock" > $log_filelocal end_time=$(($(date +%s) + duration))
    while [[ $(date +%s) -lt $end_time ]]; dolocal timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        # 获取每个GPU的状态
        nvidia-smi --query-gpu=index,utilization.gpu,utilization.memory,temperature.gpu,power.draw,memory.used,memory.total,clocks.current.sm,clocks.current.memory \
        --format=csv,noheader,nounits | while IFS=',' read -r gpu_id util_gpu util_mem temp power mem_used mem_total sm_clock mem_clock; doecho "$timestamp,$gpu_id,$util_gpu,$util_mem,$temp,$power,$mem_used,$mem_total,$sm_clock,$mem_clock" >> $log_filedonesleep $intervaldoneecho "监控完成，日志保存在: $log_file"# 生成简单的统计报告echo -e "\n=== 监控统计报告 ==="echo "平均GPU利用率:"tail -n +2 $log_file | awk -F',' '{sum+=$3; count++} END {print sum/count "%"}'echo "平均温度:"tail -n +2 $log_file | awk -F',' '{sum+=$5; count++} END {print sum/count "°C"}'echo "平均功耗:"tail -n +2 $log_file | awk -F',' '{sum+=$6; count++} END {print sum/count "W"}'
}

# 3. 性能压测脚本#!/bin/bash# gpu_stress_test.shstress_test() {echo "=== GPU压力测试 ==="# 测试前状态echo "测试前状态:"
    nvidia-smi --query-gpu=index,temperature.gpu,power.draw,clocks.current.graphics,clocks.current.memory \
    --format=csv
    # 启动监控（后台）
    nvidia-smi dmon -s pucvmet -d > stress_test_monitor.csv &local monitor_pid=$!
    echo "开始压力测试（持续5分钟）..."# 这里应该启动你的压力测试程序# 例如：CUDA示例程序或深度学习训练任务sleep 300  # 模拟5分钟测试# 停止监控kill $monitor_pid 2>/dev/null
    # 测试后状态echo -e "\n测试后状态:"
    nvidia-smi --query-gpu=index,temperature.gpu,power.draw,clocks.current.graphics,clocks.current.memory \
    --format=csv
    # 检查是否有节流echo -e "\n节流检查:"
    nvidia-smi --query-gpu=index,clocks.throttle_reasons.active --format=csv
    echo "监控数据保存在: stress_test_monitor.csv"
}

# 4. 定时任务监控脚本#!/bin/bash# cron_gpu_monitor.sh (用于cron定时任务)# 使用方法: */5 * * * * /path/to/cron_gpu_monitor.sh
LOG_FILE="/var/log/gpu_status.log"
ALERT_FILE="/var/log/gpu_alerts.log"# 获取当前状态
current_status=$(nvidia-smi --query-gpu=index,name,temperature.gpu,power.draw,utilization.gpu,memory.used,memory.total \
--format=csv,noheader)

# 记录到日志echo "$(date '+%Y-%m-%d %H:%M:%S'),$current_status" >> $LOG_FILE# 检查告警条件echo "$current_status" | while IFS=',' read -r index name temp power util mem_used mem_total; do# 温度告警if [[ $temp -gt 85 ]]; thenecho "$(date '+%Y-%m-%d %H:%M:%S'): GPU$index 温度过高: ${temp}°C" >> $ALERT_FILEfi# 内存告警if [[ $mem_used != "[Not Supported]" && $mem_total != "[Not Supported]" ]]; then
        mem_percent=$((mem_used * 100 / mem_total))if [[ $mem_percent -gt 90 ]]; thenecho "$(date '+%Y-%m-%d %H:%M:%S'): GPU$index 内存使用率过高: ${mem_percent}%" >> $ALERT_FILEfifidone# 保持日志文件大小（只保留最近1000行）tail -n 1000 $LOG_FILE > ${LOG_FILE}.tmp && mv ${LOG_FILE}.tmp $LOG_FILEtail -n 1000 $ALERT_FILE > ${ALERT_FILE}.tmp && mv ${ALERT_FILE}.tmp $ALERT_FILE 2>/dev/null
```

使用示例:
```bash
# 获取GPU信息
python3 gpu_monitor.py --action info

# 监控特定GPU
python3 gpu_monitor.py --action info --gpu-id 0

# 持续监控30分钟，每3秒采样一次
python3 gpu_monitor.py --action monitor --duration 1800 --interval 3

# 检查告警
python3 gpu_monitor.py --action alert

```


nvidia-smi -q 是一个用于查询 NVIDIA GPU 详细信息的命令，它会输出 GPU 的全面状态信息，包括硬件状态、性能指标、内存使用情况等。


## dcgmi & DCGM Exporter

![dcgmi client](/img/assets/tools/image.png)

### dcgmi

这个我用的不是很多，基本都是



### DCGM Exporter



# Nsight Systems(nsys)


# Nsight Compute(ncu)


# pytorch.profiler


# 


## 通过 Perfetto 打开


# Compute Sanitizer/ cuda-memcheck

# cuda-gdb
