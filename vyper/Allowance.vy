# pragma @version ^0.2.4

# TaskList is made of tasks
struct task:
    claimant: address
    message: String[32]
    bounty_entry: uint256
    completed: bool 

# Size of the task list
ENTRIES: constant(uint256) = 3

# "Parent" who gets to mask tasks, approve completion, send selfdestruct funds to
owner: public(address)

# List of task entries
tl: public(task[ENTRIES])

allowanceTotal: uint256

# Event emitted to web3 front-end when the guestbook changes. Sends
# the new bounty value.
event Entry:
    value: uint256

# Constructor that initializes guestbook and its initial entries
@external
def __init__(total: uint256, task1: String[32], reward1: uint256, task2: String[32], reward2: uint256, task3: String[32], reward3: uint256):
    assert total == reward1 + reward2 + reward3
    self.owner = msg.sender
    self.allowanceTotal = total
    for i in range(ENTRIES):
        self.tl[i].completed = False
    
    self.tl[0].message = task1
    self.tl[0].bounty_entry = reward1
    self.tl[1].message = task2
    self.tl[1].bounty_entry = reward2
    self.tl[2].message = task3
    self.tl[2].bounty_entry = reward3
    
#Marks a task as complete, can only be done by claimant
@external
def complete(desiredTask: String[32]):
    for i in range(ENTRIES):
        if self.tl[i].message == desiredTask:
            self.tl[i].claimant = msg.sender
            self.tl[i].completed = True
            break
    log Entry(self.allowanceTotal)
            
#Empties out and pays completed task to claimant, can only be done by contract owner
@external
@payable
def confirmation(desiredTask: String[32]):
    assert msg.sender == self.owner
    for i in range(ENTRIES):
        if self.tl[i].message == desiredTask:
            assert self.tl[i].completed == True
            self.tl[i].message = "No task at this time"
            self.tl[i].completed = False
            self.allowanceTotal -= self.tl[i].bounty_entry
            
            send(self.tl[i].claimant, self.tl[i].bounty_entry)
            
            self.tl[i].claimant = 0x0000000000000000000000000000000000000000
            self.tl[i].bounty_entry = 0
            break
    log Entry(self.allowanceTotal)
    
@external
def reject(desiredTask: String[32]):
    assert msg.sender == self.owner
    for i in range(ENTRIES):
        if self.tl[i].message == desiredTask:
            assert self.tl[i].completed == True
            self.tl[i].completed = False
            self.tl[i].claimant = 0x0000000000000000000000000000000000000000
            break
    log Entry(self.allowanceTotal)
    
@external
@view
def v_getRewardVal(arg: String[32]) -> uint256:
    for i in range(ENTRIES):
        if self.tl[i].message == arg:
            return self.tl[i].bounty_entry
    return 0

# Destroy contract and return funds to the contract owner
@external
def cashOut():
    selfdestruct(self.owner)

@external
@view
def v_getBalance() -> uint256:
    return self.balance

@external
@payable
def __default__():
    pass
